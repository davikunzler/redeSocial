// src/screens/PostDetailScreen.js

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { signOut } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postResponse = await api.get(`/posts/${postId}`);
      setPost(postResponse.data);

      const commentsResponse = await api.get(`/comments/${postId}`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error(
        "Erro ao buscar detalhes do post/comentários:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Não foi possível carregar os detalhes do post.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) {
      Alert.alert("Erro", "O comentário não pode ser vazio.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert(
          "Erro de Autenticação",
          "Você precisa estar logado para comentar."
        );
        signOut();
        return;
      }

      await api.post(
        `/comments/${postId}`,
        { content: newCommentContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert("Sucesso", "Comentário adicionado!");
      setNewCommentContent("");
      fetchPostAndComments();
    } catch (error) {
      console.error(
        "Erro ao criar comentário:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erro ao Comentar",
        error.response?.data?.message ||
          "Ocorreu um erro ao adicionar o comentário."
      );
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Post não encontrado.</Text>
      </View>
    );
  }

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        {item.profile_picture_url ? (
          <Image
            source={{ uri: `http://localhost:3001${item.profile_picture_url}` }}
            style={styles.commentProfilePicture}
          />
        ) : (
          <Ionicons
            name="person-circle"
            size={30}
            color="#ccc"
            style={styles.commentProfilePicturePlaceholder}
          />
        )}
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentTimestamp}>
          {new Date(item.created_at).toLocaleString("pt-BR")}
        </Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Post</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.postDetailCard}>
          <View style={styles.postHeader}>
            {post.profile_picture_url ? (
              <Image
                source={{
                  uri: `http://localhost:3001${post.profile_picture_url}`,
                }}
                style={styles.profilePicture}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={40}
                color="#ccc"
                style={styles.profilePicturePlaceholder}
              />
            )}
            <Text style={styles.postUsername}>{post.username}</Text>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.image_url && (
            <Image
              source={{ uri: `http://localhost:3001${post.image_url}` }}
              style={styles.postImage}
            />
          )}
          <View style={styles.postStatsContainer}>
            <Text style={styles.postStats}>{post.likes_count} Curtidas</Text>
            <Text style={styles.postStats}>
              {post.comments_count} Comentários
            </Text>
          </View>
        </View>

        <Text style={styles.commentsTitle}>Comentários</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCommentItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.noCommentsText}>
              Nenhum comentário ainda. Seja o primeiro!
            </Text>
          }
        />

        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Adicione um comentário..."
            placeholderTextColor="#aaa"
            value={newCommentContent}
            onChangeText={setNewCommentContent}
            multiline
          />
          <TouchableOpacity
            style={styles.commentButton}
            onPress={handleCreateComment}
            disabled={isSubmittingComment}
          >
            <Text style={styles.commentButtonText}>
              {isSubmittingComment ? "Enviando..." : "Comentar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  postDetailCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicturePlaceholder: {
    marginRight: 10,
  },
  postUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFD700",
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#ccc",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover",
  },
  postStatsContainer: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
    justifyContent: "space-around",
  },
  postStats: {
    fontSize: 14,
    color: "#FFD700",
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    color: "#FFD700",
  },
  commentCard: {
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentProfilePicturePlaceholder: {
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFD700",
    flex: 1,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#aaa",
  },
  commentContent: {
    fontSize: 14,
    color: "#ccc",
    marginLeft: 38,
  },
  addCommentContainer: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#121212",
    color: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },
  commentButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
  noCommentsText: {
    color: "#aaa",
    marginHorizontal: 15,
    marginBottom: 10,
  },
});

export default PostDetailScreen;
