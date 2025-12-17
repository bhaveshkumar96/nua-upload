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
  useToast
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ExternalLinkIcon } from "@chakra-ui/icons";
const Dashboard = () => {
  const [files, setFiles] = React.useState([]);
  const toast = useToast();
  const handleDownload = async (file) => {
    const token = localStorage.getItem("user_token");
    const BACKEND_URL = "https://nua-upload.onrender.com"
      // process.env.BACKEND_URL || "http://localhost:4000";

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
  const BACKEND_URL = "https://nua-upload.onrender.com"
    // process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

  // 24 hours expiry
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

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
      description:
        error.response?.data?.message || error.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });

    console.error("Share error:", error);
  }
};


  const getFiles = async () => {
    const token = localStorage.getItem("user_token");
    const BACKEND_URL = "https://nua-upload.onrender.com"
      // process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

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
  return (
    <TableContainer bg="white" rounded="md" shadow="sm">
      <Heading>Dashboard</Heading>
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Filename</Th>
            <Th>Type</Th>
            <Th isNumeric>Size</Th>
            <Th>Upload Date</Th>
            <Th textAlign="center">Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {files.length > 0 ? (
            files.map((file) => (
              <Tr key={file._id}>
                <Td>
                  <Text fontWeight="500">{file.filename}</Text>
                </Td>
                <Td>{file.mimeType}</Td>
                <Td isNumeric>{(file.size / 1024 / 1024).toFixed(2)} MB</Td>
                <Td>{new Date(file.createdAt).toLocaleDateString()}</Td>
                <Td textAlign="center">
                  <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<DownloadIcon />}
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </Button>
                </Td>
                <Td textAlign="center">
                  <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<ExternalLinkIcon />}
                    onClick={() => handleShare(file)}
                  >
                    Share
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={5} textAlign="center">
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
