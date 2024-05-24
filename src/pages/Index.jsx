import { useState } from "react";
import { Container, VStack, Text, Box, Input, Button, HStack, IconButton } from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown, FaLaugh, FaSadTear } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Index = () => {
  const [newPost, setNewPost] = useState("");
  const queryClient = useQueryClient();

  const { data: posts, isLoading, isError } = useQuery(['posts'], async () => {
    const { data, error } = await supabase.from('posts').select('*');
    if (error) throw new Error(error.message);
    return data;
  });

  const addPostMutation = useMutation(async (newPost) => {
    const { data, error } = await supabase.from('posts').insert([{ title: newPost, body: newPost }]);
    if (error) throw new Error(error.message);
    return data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
    }
  });

  const addPost = () => {
    if (newPost.trim() !== "") {
      addPostMutation.mutate(newPost);
      setNewPost("");
    }
  };

  const addReactionMutation = useMutation(async ({ postId, reaction }) => {
    const { data, error } = await supabase.from('reactions').insert([{ post_id: postId, emoji: reaction }]);
    if (error) throw new Error(error.message);
    return data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
    }
  });

  const addReaction = (postId, reaction) => {
    addReactionMutation.mutate({ postId, reaction });
  };

  return (
    <Container centerContent maxW="container.md" py={10}>
      <VStack spacing={4} width="100%">
        <Text fontSize="2xl" mb={4}>Public Postboard</Text>
        <HStack width="100%">
          <Input
            placeholder="Write a new post..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Button onClick={addPost} colorScheme="blue">Post</Button>
        </HStack>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : isError ? (
          <Text>Error loading posts</Text>
        ) : (
          <VStack spacing={4} width="100%">
            {posts.map((post, index) => (
              <Box key={index} p={4} borderWidth="1px" borderRadius="md" width="100%">
                <Text mb={2}>{post.body}</Text>
                <HStack spacing={4}>
                  <IconButton
                    aria-label="Like"
                    icon={<FaThumbsUp />}
                    onClick={() => addReaction(post.id, "👍")}
                  />
                  <IconButton
                    aria-label="Dislike"
                    icon={<FaThumbsDown />}
                    onClick={() => addReaction(post.id, "👎")}
                  />
                  <IconButton
                    aria-label="Laugh"
                    icon={<FaLaugh />}
                    onClick={() => addReaction(post.id, "😂")}
                  />
                  <IconButton
                    aria-label="Sad"
                    icon={<FaSadTear />}
                    onClick={() => addReaction(post.id, "😢")}
                  />
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default Index;