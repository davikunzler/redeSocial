// src/screens/EditProfileScreen.js

import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const EditProfileScreen = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const { signOut } = useContext(AuthContext);

  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    initialUser.profile_picture_url
  );
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão Negada",
            "Precisamos de permissão para acessar a galeria!"
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      setProfilePictureUrl(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Erro de autenticação", "Você não está logado.");
        signOut();
        return;
      }

      let finalProfilePictureUrl = profilePictureUrl;

      if (selectedImageUri) {
        const formData = new FormData();
        const filename = selectedImageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        if (Platform.OS === "web") {
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type });
          formData.append("profilePicture", file);
        } else {
          formData.append("profilePicture", {
            uri: selectedImageUri,
            name: filename,
            type: type,
          });
        }

        try {
          const uploadResponse = await api.post(
            "/upload/profile-picture",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          finalProfilePictureUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error(
            "Erro ao fazer upload da imagem de perfil:",
            uploadError.response?.data || uploadError.message
          );
          Alert.alert(
            "Erro de Upload",
            "Não foi possível fazer upload da foto."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const updateData = {
        username:
          username.trim() === initialUser.username
            ? undefined
            : username.trim(),
        email: email.trim() === initialUser.email ? undefined : email.trim(),
        profile_picture_url:
          finalProfilePictureUrl === initialUser.profile_picture_url
            ? undefined
            : finalProfilePictureUrl,
      };

      if (newPassword) {
        updateData.old_password = oldPassword;
        updateData.new_password = newPassword;
      }

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(filteredUpdateData).length === 0 && !selectedImageUri) {
        Alert.alert("Aviso", "Nenhuma alteração detectada.");
        setIsSubmitting(false);
        return;
      }

      const response = await api.put("/users/me", filteredUpdateData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      Alert.alert("Sucesso", response.data.message);
      navigation.goBack();
    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Ocorreu um erro ao atualizar o perfil."
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.profilePictureContainer}
        >
          {profilePictureUrl ? (
            <Image
              source={{ uri: profilePictureUrl }}
              style={styles.profilePicture}
            />
          ) : (
            <Ionicons name="camera-outline" size={80} color="#ccc" />
          )}
          <Text style={styles.changePhotoText}>Trocar foto de perfil</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nome de Usuário"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.sectionTitle}>Mudar Senha (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha Antiga"
          placeholderTextColor="#aaa"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          placeholderTextColor="#aaa"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Nova Senha"
          placeholderTextColor="#aaa"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // fundo dark
  },
  scrollViewContent: {
    padding: 20,
    alignItems: "center",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  changePhotoText: {
    marginTop: 10,
    color: "#FFD700",
    textDecorationLine: "underline",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#111",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfileScreen;
