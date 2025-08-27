// src/screens/RegisterScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import api from "../services/api"; // Importa a instância do Axios

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos antes de cadastrar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      Alert.alert(
        "Sucesso",
        "Usuário cadastrado com sucesso! Faça login para continuar."
      );
      navigation.navigate("Login"); // Volta para a tela de login após o cadastro
    } catch (error) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
      Alert.alert(
        "Erro no Cadastro",
        error.response?.data?.message || "Ocorreu um erro ao tentar cadastrar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de Usuário"
        placeholderTextColor="#AAAAAA"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#AAAAAA"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#AAAAAA"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.registerButton, isSubmitting && styles.disabledButton]}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        <Text style={styles.registerButtonText}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginLinkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // fundo dark
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF", // branco
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#1E1E1E", // input escuro
    borderWidth: 1,
    borderColor: "#333333",
    color: "#FFFFFF", // texto branco
    fontSize: 16,
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#FFD700", // dourado
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#C0A800", // dourado escuro quando desabilitado
  },
  registerButtonText: {
    color: "#000000", // texto preto
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#FFD700", // dourado
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
