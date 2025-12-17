import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Button,
  Heading,
  Spinner,
  useToast,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Share = () => {
  const { fileId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({}); // { fileId: userId }
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const BACKEND_URL =
    process.env.BACKEND_URL || "http://localhost:4000";
  const token = localStorage.getItem("user_token");

  const getUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: "Failed to load users",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (fileId, userId) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [fileId]: userId, // single user ID
    }));
  };

  const handleShare = async (file) => {
    const userId = selectedUsers[file._id]; // single userId

    if (!userId) {
      toast({
        title: "No user selected",
        description: "Please select a user to share the file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/files/${file._id}/share/user`,
        { userId, role: "viewer", expiresAt: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "File shared successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error(
        "Share error",
        error.response?.data?.message || error.message
      );
      toast({
        title: "Failed to share file",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const getFiles = async () => {
    const token = localStorage.getItem("user_token");
    const BACKEND_URL =
      process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

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
    getUsers();
    getFiles();
  }, []);

  return (
    <Box p="6" bg="white" rounded="md" shadow="sm">
      <Heading size="md" mb="4">
        Share File with Users
      </Heading>

      {loading ? (
        <Spinner />
      ) : (
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
                    <Td>
                      <FormControl>
                        <FormLabel>Select User</FormLabel>
                        <Select
                          size="sm"
                          placeholder="Select a user"
                          value={selectedUsers[file._id] || ""} // single userId
                          onChange={(e) =>
                            handleUserSelect(file._id, e.target.value)
                          }
                        >
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.email}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </Td>

                    <Td>
                      <Button
                        size="sm"
                        colorScheme="purple"
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
      )}

      <Button
        mt="4"
        colorScheme="purple"
        onClick={handleShare}
        isDisabled={!selectedUsers.length}
      >
        Share with Selected Users
      </Button>
    </Box>
  );
};

export default Share;
