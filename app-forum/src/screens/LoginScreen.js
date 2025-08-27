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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos antes de entrar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", { identifier, password });
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      await signIn(response.data.token, response.data.user);
      Alert.alert("Sucesso", "Login realizado com sucesso!");
    } catch (error) {
      console.error("Erro no login:", error.response?.data || error.message);
      Alert.alert(
        "Erro no Login",
        error.response?.data?.message ||
          "Ocorreu um erro ao tentar fazer login."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário ou E-mail"
        placeholderTextColor="#AAAAAA"
        value={identifier}
        onChangeText={setIdentifier}
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
        style={[styles.loginButton, isSubmitting && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={styles.loginButtonText}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerButtonText}>
          Não tem uma conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333333",
    color: "#FFFFFF",
    fontSize: 16,
  },
  loginButton: {
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
    backgroundColor: "#C0A800", // dourado mais escuro para desabilitado
  },
  loginButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerButton: {
    marginTop: 20,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FFD700",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
