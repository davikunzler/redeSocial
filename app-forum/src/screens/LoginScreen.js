import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";
import AuthContext from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      await signIn(response.data.token, response.data.user);
    } catch (error) {
      console.error("Erro no login:", error.response?.data || error.message);
      Alert.alert(
        "Erro no Login",
        error.response?.data?.message ||
          "Ocorreu um erro ao tentar fazer login."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário ou E-mail"
        placeholderTextColor="#999"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botão customizado */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000000", // preto
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#fff", // branco
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#444", // cinza escuro
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff", // branco
    color: "#000",
  },
  loginButton: {
    backgroundColor: "#FFD700", // dourado
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#000", // preto
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    marginTop: 20,
    color: "#FFD700", // dourado
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
