import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { Plus, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  ControlledTextAreaField,
  ControlledTextInputField,
  EmptyState,
  ForumItemCard,
  MOBILE_SHELL_MAX_WIDTH,
  SearchField,
  useToast,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { resolveUserAvatar } from "@/lib/avatar-fallbacks";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getErrorMessage } from "@/lib/get-error-message";

type ForumPostWithAuthor = Doc<"forumPosts"> & {
  author: (Doc<"users"> & { avatarUrl?: string | null }) | null;
};

type ListedPost = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  avatar: ReturnType<typeof resolveUserAvatar>;
  publishedAt: number;
};

export default function ForumTabScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const postsPage = useQuery(
    api.forumPosts.list,
    isAuthenticated
      ? { paginationOpts: { numItems: 50, cursor: null } }
      : "skip",
  );
  const createPost = useMutation(api.forumPosts.create);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: { title: "", description: "" },
    mode: "onChange",
  });
  const isSubmitting = formState.isSubmitting;

  const allPosts: ListedPost[] = useMemo(() => {
    const page = (postsPage?.page ?? []) as ForumPostWithAuthor[];
    return page
      .map((post) => ({
        id: post._id,
        title: post.title,
        description: post.content,
        authorName: post.author?.name ?? "Usuario",
        avatar: resolveUserAvatar(post.author?.avatarUrl),
        publishedAt: post._creationTime,
      }))
      .sort((left, right) => right.publishedAt - left.publishedAt);
  }, [postsPage]);

  const visiblePosts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (normalized.length === 0) return allPosts;
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(normalized) ||
        post.description.toLowerCase().includes(normalized),
    );
  }, [allPosts, search]);

  const hasPosts = visiblePosts.length > 0;
  const isLoading = isAuthenticated && postsPage === undefined;

  const openModal = () => {
    setSubmitError(null);
    reset({ title: "", description: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const goToPost = (postId: string) => {
    router.push(`/forum-post?postId=${encodeURIComponent(postId)}` as Href);
  };

  const handleCreatePost = handleSubmit(async (values) => {
    const title = values.title.trim();
    const description = values.description.trim();
    if (title.length === 0 || description.length === 0) {
      setSubmitError("Completa el título y la descripción.");
      return;
    }

    try {
      setSubmitError(null);
      const newId = (await createPost({
        title,
        content: description,
        category: "general",
      })) as Id<"forumPosts">;
      setIsModalOpen(false);
      reset({ title: "", description: "" });
      showToast({ message: "Pregunta publicada.", variant: "success" });
      goToPost(newId);
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
      Alert.alert("No se pudo crear", getErrorMessage(caughtError));
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <View className="flex-1 gap-4 px-5 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
            Foro
          </Text>
          <Pressable
            accessibilityLabel="Crear pregunta"
            accessibilityRole="button"
            hitSlop={8}
            onPress={openModal}
          >
            <Plus color={AppColors.cobalto} size={26} strokeWidth={2.4} />
          </Pressable>
        </View>

        <SearchField
          label="Buscar"
          onChangeText={setSearch}
          placeholder="Buscar en el foro"
          value={search}
        />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.cobalto} size="large" />
          </View>
        ) : hasPosts ? (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {visiblePosts.map((post) => (
              <ForumItemCard
                authorName={post.authorName}
                avatar={post.avatar}
                description={post.description}
                key={post.id}
                onPress={() => goToPost(post.id)}
                publishedAt={formatRelativeTime(post.publishedAt)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            actionLabel="Crear pregunta"
            className="min-h-0 flex-1"
            onActionPress={openModal}
            title="Aún no hay preguntas en el foro, pero puedes ser el primero en hacer una."
          />
        )}
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeModal}
        transparent
        visible={isModalOpen}
      >
        <View className="flex-1 items-center justify-end">
          <View
            className="flex-1 justify-end"
            style={{ width: "100%", maxWidth: MOBILE_SHELL_MAX_WIDTH }}
          >
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              className="absolute inset-0 bg-cobalto/40"
              onPress={closeModal}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View className="rounded-t-component border border-gris bg-blanco px-5 pt-4 pb-6 shadow-sm">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
                    Nueva pregunta
                  </Text>
                  <Pressable
                    accessibilityLabel="Cerrar"
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    hitSlop={10}
                    onPress={closeModal}
                  >
                    <X color={AppColors.cobalto} size={22} strokeWidth={2.2} />
                  </Pressable>
                </View>

                <View className="gap-3">
                  <ControlledTextInputField
                    control={control}
                    editable={!isSubmitting}
                    label="Título"
                    name="title"
                    placeholder="Ej: Mi perro no quiere comer desde ayer"
                    rules={{ required: "Ingresa un título." }}
                  />

                  <ControlledTextAreaField
                    control={control}
                    editable={!isSubmitting}
                    label="Descripción"
                    name="description"
                    placeholder="Ej: Mi perro tiene 3 años, desde ayer no come y está más quieto de lo normal. Solo toma agua y no ha vomitado. ¿Alguien ha pasado por algo similar?"
                    rules={{ required: "Ingresa una descripción." }}
                  />

                  {submitError ? (
                    <Text className="font-sans text-[12px] text-rojo">
                      {submitError}
                    </Text>
                  ) : null}

                  <Button
                    className="self-end"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    onPress={handleCreatePost}
                    variant="cobalto"
                  >
                    Crear
                  </Button>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
