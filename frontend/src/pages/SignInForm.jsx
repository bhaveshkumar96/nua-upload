import React, { useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const BACKEND_URL = "https://nua-upload.onrender.com";
  const toast = useToast();
  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    console.log("Email:", email, "Password:", password);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/users/login`, {
        email,
        password,
      });
      console.log("Login successful:", data);

      if (data.token) {
        localStorage.setItem("user_token", data.token);
        toast({
          title: "Success",
          description: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
    } catch (error) {
      console.error("Registration failed:", error.response.data);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, purple.400, purple.600)"
      p="4"
    >
      <Box
        bg="white"
        p="8"
        rounded="lg"
        shadow="lg"
        w={{ base: "90%", md: "400px" }}
      >
        <Heading mb="4" textAlign="center" color="gray.700">
          Sign In
        </Heading>
        <Text mb="6" textAlign="center" color="gray.500">
          Enter your email and password to sign in
        </Text>

        <FormControl mb="4">
          <FormLabel color="gray.700">Email</FormLabel>
          <Input
            type="email"
            placeholder="mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl mb="4">
          <FormLabel color="gray.700">Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement>
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleTogglePassword}
                variant="ghost"
              >
                {showPassword ? <RiEyeCloseLine /> : <MdOutlineRemoveRedEye />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button colorScheme="purple" w="100%" mb="2" onClick={handleLogin}>
          Sign In
        </Button>
        <Text textAlign="center" mt="3" fontSize="sm">
  Don't have an account?{" "}
  <Link to="/signup">
    <Text as="span" color="purple.500" fontWeight="bold" cursor="pointer">
      Sign up
    </Text>
  </Link>
</Text>
      </Box>
    </Flex>
  );
};

export default SignInForm;
