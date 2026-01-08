import React, { useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Text,
  Heading,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ExternalLinkIcon } from "@chakra-ui/icons";
const Dashboard = () => {
  const [files, setFiles] = React.useState([]);
  const toast = useToast();
  const currentUserId = JSON.parse(localStorage.getItem("user")) || {};
  const isOwner = (file) => file.owner === currentUserId._id;
  const getUserEmail = (userId) => {
    // If later you populate user, replace this logic
    return userId.name; // short ID for now
  };
  const BACKEND_URL = "https://nua-upload.onrender.com";
  const formatDateTime = (date) => new Date(date).toLocaleString();

  const isSharedWithMe = (file) =>
    file.sharedWith?.some(
      (u) =>
        u.user._id === currentUserId._id &&
        (!u.expiresAt || new Date(u.expiresAt) > new Date())
    );

  const hasActiveShareLink = (file) =>
    file.shareLink?.some(
      (l) => !l.expiresAt || new Date(l.expiresAt) > new Date()
    );

  const handleDownload = async (file) => {
    const token = localStorage.getItem("user_token");

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/files/download/${file._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([data]));
      console.log("response", data);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName || file.filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download error:",
        error.response?.data?.message || error.message
      );
    }
  };
  const handleShare = async (file) => {
    const token = localStorage.getItem("user_token");
    // 24 hours expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/files/${file._id}/share/link`,
        { expiresAt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Use shareUrl from backend
      const { shareUrl, expiresAt: expiry } = data;

      // Copy link to clipboard
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Share link created",
        description: `Link copied. Expires on ${new Date(
          expiry
        ).toLocaleString()}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      console.error("Share error:", error);
    }
  };

  const getFiles = async () => {
    const token = localStorage.getItem("user_token");
    try {
      const { data } = await axios.get(`${BACKEND_URL}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Files:", data.files);
      setFiles(data.files);
    } catch (error) {
      console.error(
        "Error fetching files:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    getFiles();
  }, []);
  console.log("Files:", currentUserId);

  return (
    <TableContainer bg="white" rounded="md" shadow="sm">
      <Heading>Dashboard</Heading>
      <Table variant="simple" size={"sm"}>
        <Thead bg="gray.50">
          <Tr>
            <Th>Filename</Th>
            <Th>Type</Th>
            <Th isNumeric>Size</Th>
            <Th>Upload Date</Th>
            <Th>Access</Th>
            <Th>Shared With</Th>
            <Th>Activity</Th>
            <Th textAlign="center">Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {files.length > 0 ? (
            files.map((file) => (
              <Tr key={file._id}>
                <Td>
                  <Text fontWeight="500">
                    {file.originalName || file.filename}
                  </Text>
                </Td>

                <Td>{file.mimeType}</Td>

                <Td isNumeric>{(file.size / 1024 / 1024).toFixed(2)} MB</Td>

                <Td>{new Date(file.createdAt).toLocaleDateString()}</Td>

                <Td>
                  {isOwner(file) && (
                    <Text color="green.500" fontWeight="bold">
                      Owner
                    </Text>
                  )}

                  {!isOwner(file) && isSharedWithMe(file) && (
                    <Text color="blue.500">Shared with you</Text>
                  )}

                  {!isOwner(file) &&
                    !isSharedWithMe(file) &&
                    hasActiveShareLink(file) && (
                      <Text color="purple.500">Link access</Text>
                    )}
                </Td>
                <Td>
                  {file.sharedWith?.length > 0 ? (
                    <Tooltip
                      label={file.sharedWith.map((u, i) => (
                        <Text key={i}>
                          👤 {getUserEmail(u.user)} ({u.role})
                          {u.expiresAt &&
                            ` • expires ${formatDateTime(u.expiresAt)}`}
                        </Text>
                      ))}
                      hasArrow
                      placement="top-start"
                    >
                      <Text color="blue.500" cursor="pointer">
                        {file.sharedWith.length} user(s)
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text color="gray.400">Not shared</Text>
                  )}
                </Td>

                <Td>
                  {file.activityLog?.length > 0 ? (
                    <Tooltip
                      label={file.activityLog
                        .slice()
                        .reverse()
                        .map((log, i) => (
                          <Text key={i}>
                            🔹 {log.action.toUpperCase()} by{" "}
                            {getUserEmail(log.userId)} <br />⏰{" "}
                            {formatDateTime(log.createdAt)}
                            {log.expiresAt && (
                              <>
                                <br />⌛ Expires:{" "}
                                {formatDateTime(log.expiresAt)}
                              </>
                            )}
                          </Text>
                        ))}
                      hasArrow
                      placement="top-start"
                      maxW="300px"
                    >
                      <Text cursor="pointer" color="purple.600">
                        View ({file.activityLog.length})
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text color="gray.400">No activity</Text>
                  )}
                </Td>

                <Td textAlign="center">
                  <Button
                    size="xs"
                    colorScheme="purple"
                    leftIcon={<DownloadIcon />}
                    mr={2}
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </Button>

                  {isOwner(file) && (
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="purple"
                      leftIcon={<ExternalLinkIcon />}
                      onClick={() => handleShare(file)}
                    >
                      Share
                    </Button>
                  )}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={7} textAlign="center">
                No files found
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Dashboard;
