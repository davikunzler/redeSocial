// src/screens/ProfileScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("myPosts");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        signOut();
        return;
      }

      const userResponse = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setUser(userResponse.data);

      const myPostsResponse = await api.get("/users/me/posts", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setMyPosts(myPostsResponse.data);

      const favoritePostsResponse = await api.get("/users/me/favorites", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setFavoritePosts(favoritePostsResponse.data);
    } catch (error) {
      console.error(
        "Erro ao buscar dados do perfil:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível carregar o perfil."
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
    >
      <View style={styles.postCard}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContentPreview}>
          {item.content.substring(0, 100)}...
        </Text>
        <View style={styles.postStatsRow}>
          <Text style={styles.postStatItem}>{item.likes_count} Curtidas</Text>
          <Text style={styles.postStatItem}>
            {item.comments_count} Comentários
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Perfil não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile", { user })}
          style={styles.editButton}
        >
          <Ionicons name="settings-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Informações do Usuário */}
        <View style={styles.profileInfoCard}>
          {user.profile_picture_url ? (
            <Image
              source={{
                uri: `${api.defaults.baseURL.replace("/api", "")}${
                  user.profile_picture_url
                }`,
              }}
              style={styles.profilePicture}
            />
          ) : (
            <Ionicons
              name="person-circle"
              size={100}
              color="#FFD700"
              style={styles.profilePicturePlaceholder}
            />
          )}
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.memberSince}>
            Membro desde:{" "}
            {new Date(user.created_at).toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "myPosts" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("myPosts")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "myPosts" && styles.activeTabText,
              ]}
            >
              Meus Posts ({myPosts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "favorites" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("favorites")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "favorites" && styles.activeTabText,
              ]}
            >
              Favoritos ({favoritePosts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        {activeTab === "myPosts" ? (
          myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              scrollEnabled={false}
              contentContainerStyle={styles.postListContent}
            />
          ) : (
            <Text style={styles.noContentText}>
              Você ainda não fez nenhum post.
            </Text>
          )
        ) : favoritePosts.length > 0 ? (
          <FlatList
            data={favoritePosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPostItem}
            scrollEnabled={false}
            contentContainerStyle={styles.postListContent}
          />
        ) : (
          <Text style={styles.noContentText}>
            Você ainda não favoritou nenhum post.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: { color: "#fff", marginTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFD700" },
  backButton: { padding: 5 },
  editButton: { padding: 5 },
  scrollViewContent: { paddingBottom: 20 },
  profileInfoCard: {
    backgroundColor: "#111",
    padding: 20,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    elevation: 5,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  profilePicturePlaceholder: { marginBottom: 15 },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  email: { fontSize: 16, color: "#ccc", marginBottom: 5 },
  memberSince: { fontSize: 14, color: "#aaa" },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: "#111",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: "#FFD700" },
  tabText: { fontSize: 16, fontWeight: "500", color: "#ccc" },
  activeTabText: { color: "#FFD700" },
  postListContent: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20 },
  postCard: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#FFD700",
  },
  postContentPreview: { fontSize: 14, color: "#ccc", marginBottom: 10 },
  postStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 8,
  },
  postStatItem: { fontSize: 13, color: "#aaa" },
  noContentText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
  },
});

export default ProfileScreen;
