import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  VStack,
  List,
  ListItem,
} from "@chakra-ui/react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
const UploadFile = () => {
    const BACKEND_URL = "https://nua-upload.onrender.com"
  const [files, setFiles] = useState([]);
  const toast = useToast();
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

const handleSubmit = async () => {
  if (!files.length) {
    toast({
      title: "No files selected",
      description: "Please select files to upload.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const token = localStorage.getItem("user_token");

    // process.env.BACKEND_URL || "http://localhost:4000";

  try {
    const response = await axios.post(
      `${BACKEND_URL}/files/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload progress:", percent, "%");
        },
      }
    );

    toast({
      title: "Files uploaded successfully",
      description: `${response.data?.files?.length || files.length} file(s) uploaded`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // clear files after success
    setFiles([]);

  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Upload failed";

    toast({
      title: "Upload failed",
      description: message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });

    console.error("Upload error:", error);
  }
};

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg="white"
        p="6"
        rounded="lg"
        shadow="md"
        w={{ base: "90%", md: "400px" }}
      >
        <VStack spacing="4">
          <Text fontSize="xl" fontWeight="bold">
            Upload Files
          </Text>

          <Input type="file" multiple onChange={handleFileChange} />

          {files.length > 0 && (
            <Box w="100%">
              <Text fontSize="sm" mb="2">
                Selected Files:
              </Text>
              <List spacing="1">
                {files.map((file, index) => (
                  <ListItem key={index} fontSize="sm">
                    {file.name}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Button colorScheme="purple" w="100%" onClick={handleSubmit}>
            Submit
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default UploadFile;
