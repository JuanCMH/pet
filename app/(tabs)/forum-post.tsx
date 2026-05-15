import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, X } from "lucide-react-native";
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
  Avatar,
  Button,
  ControlledTextAreaField,
  MOBILE_SHELL_MAX_WIDTH,
  useToast,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { resolveUserAvatar } from "@/lib/avatar-fallbacks";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getErrorMessage } from "@/lib/get-error-message";

type Answer = {
  id: string;
  authorName: string;
  avatar: ReturnType<typeof resolveUserAvatar>;
  content: string;
  publishedAt: number;
};

type PostView = {
  title: string;
  content: string;
  authorName: string;
  avatar: ReturnType<typeof resolveUserAvatar>;
  publishedAt: number;
};

type RealPost = Doc<"forumPosts"> & {
  author: (Doc<"users"> & { avatarUrl?: string | null }) | null;
};

type RealComment = Doc<"forumComments"> & {
  author: (Doc<"users"> & { avatarUrl?: string | null }) | null;
};

export default function ForumPostScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { isAuthenticated } = useConvexAuth();

  const realPostId =
    typeof postId === "string" ? (postId as Id<"forumPosts">) : null;

  const forumRoute = "/(tabs)/forum" as Href;
  const goBack = () => router.replace(forumRoute);

  const realPost = useQuery(
    api.forumPosts.getById,
    realPostId && isAuthenticated ? { postId: realPostId } : "skip",
  ) as RealPost | null | undefined;

  const commentsPage = useQuery(
    api.forumComments.listByPost,
    realPostId && isAuthenticated
      ? {
          postId: realPostId,
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip",
  );

  const createComment = useMutation(api.forumComments.create);
  const { showToast } = useToast();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch, formState } = useForm<{
    reply: string;
  }>({
    defaultValues: { reply: "" },
    mode: "onChange",
  });
  const isSending = formState.isSubmitting;
  const replyValue = watch("reply");

  const post: PostView | null = useMemo(() => {
    if (!realPost) return null;
    return {
      title: realPost.title,
      content: realPost.content,
      authorName: realPost.author?.name ?? "Usuario",
      avatar: resolveUserAvatar(realPost.author?.avatarUrl),
      publishedAt: realPost._creationTime,
    };
  }, [realPost]);

  const answers: Answer[] = useMemo(() => {
    const page = (commentsPage?.page ?? []) as RealComment[];
    return page
      .map((comment) => ({
        id: comment._id,
        authorName: comment.author?.name ?? "Usuario",
        avatar: resolveUserAvatar(comment.author?.avatarUrl),
        content: comment.content,
        publishedAt: comment._creationTime,
      }))
      .sort((left, right) => right.publishedAt - left.publishedAt);
  }, [commentsPage]);

  const isLoading = realPost === undefined || commentsPage === undefined;

  const openReply = () => {
    setReplyError(null);
    reset({ reply: "" });
    setIsReplyOpen(true);
  };

  const closeReply = () => {
    if (isSending) return;
    setIsReplyOpen(false);
  };

  const handleSendReply = handleSubmit(async (values) => {
    const content = values.reply.trim();
    if (content.length === 0) {
      setReplyError("Escribe una respuesta antes de enviar.");
      return;
    }
    if (!realPostId) return;

    try {
      setReplyError(null);
      await createComment({ postId: realPostId, content });
      reset({ reply: "" });
      setIsReplyOpen(false);
      showToast({ message: "Respuesta enviada.", variant: "success" });
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);
      setReplyError(message);
      Alert.alert("No se pudo responder", message);
    }
  });

  if (!postId) {
    return (
      <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-cobalto">
            No se encontró la pregunta.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <View className="flex-1 gap-4 px-5 pt-3">
        <View className="h-10 flex-row items-center">
          <Pressable
            accessibilityLabel="Regresar"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center"
            hitSlop={12}
            onPress={goBack}
          >
            <ArrowLeft color={AppColors.cobalto} size={24} strokeWidth={2.4} />
          </Pressable>
          <Text className="flex-1 text-center font-bold text-[24px] leading-[28px] text-cobalto">
            Pregunta
          </Text>
          <Button
            disabled={isLoading || !post}
            onPress={openReply}
            variant="cyan"
          >
            Responder
          </Button>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.cobalto} size="large" />
          </View>
        ) : !post ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-cobalto">
              No se encontró la pregunta.
            </Text>
          </View>
        ) : (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm">
              <Text className="font-semibold text-[18px] leading-[24px] text-cobalto">
                {post.title}
              </Text>
              <Text className="font-light text-[16px] leading-[22px] text-cobalto">
                {post.content}
              </Text>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-2">
                  <Avatar
                    alt={`Avatar de ${post.authorName}`}
                    size="sm"
                    source={post.avatar}
                  />
                  <Text className="font-semibold text-[14px] text-cobalto">
                    {post.authorName}
                  </Text>
                </View>
                <Text className="text-[12px] text-cobalto/70">
                  {formatRelativeTime(post.publishedAt)}
                </Text>
              </View>
            </View>

            <Text className="font-semibold text-[16px] leading-[20px] text-cobalto">
              Respuestas
            </Text>

            {answers.length === 0 ? (
              <Text className="text-center font-light text-[14px] text-cobalto/70">
                Aún no hay respuestas. ¡Sé el primero en responder!
              </Text>
            ) : (
              <View className="gap-3">
                {answers.map((answer) => (
                  <View
                    className="flex-row gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm"
                    key={answer.id}
                  >
                    <Avatar
                      alt={`Avatar de ${answer.authorName}`}
                      size="sm"
                      source={answer.avatar}
                    />
                    <View className="flex-1 gap-1">
                      <Text className="font-semibold text-[14px] text-cobalto">
                        {answer.authorName}
                      </Text>
                      <Text className="font-light text-[14px] leading-[20px] text-cobalto">
                        {answer.content}
                      </Text>
                      <Text className="text-[12px] text-cobalto/70">
                        {formatRelativeTime(answer.publishedAt)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeReply}
        transparent
        visible={isReplyOpen}
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
              onPress={closeReply}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View className="rounded-t-component border border-gris bg-blanco px-5 pt-4 pb-6 shadow-sm">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
                    Responder
                  </Text>
                  <Pressable
                    accessibilityLabel="Cerrar"
                    accessibilityRole="button"
                    disabled={isSending}
                    hitSlop={10}
                    onPress={closeReply}
                  >
                    <X color={AppColors.cobalto} size={22} strokeWidth={2.2} />
                  </Pressable>
                </View>

                <View className="gap-3">
                  <ControlledTextAreaField
                    control={control}
                    editable={!isSending}
                    label="Respuesta"
                    name="reply"
                    placeholder="Escribe tu respuesta aquí"
                    rows={5}
                    rules={{ required: "Escribe una respuesta." }}
                  />

                  {replyError ? (
                    <Text className="font-sans text-[12px] text-rojo">
                      {replyError}
                    </Text>
                  ) : null}

                  <Button
                    className="self-end"
                    disabled={isSending || replyValue.trim().length === 0}
                    loading={isSending}
                    onPress={handleSendReply}
                    variant="cyan"
                  >
                    Enviar
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
