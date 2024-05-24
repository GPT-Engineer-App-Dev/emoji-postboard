import { useState } from "react";
import { Container, VStack, Text, Box, Input, Button, HStack, IconButton } from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown, FaLaugh, FaSadTear } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Index = () => {
  const [newPost, setNewPost] = useState("");
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery('posts', async () => {
    const { data, error } = await supabase.from('posts').select('*');
    if (error) throw new Error(error.message);
    return data;
  });

  const addPostMutation = useMutation(
    async (newPost) => {
      const { data, error } = await supabase.from('posts').insert([{ text: newPost }]);
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
      },
    }
  );

  const addReactionMutation = useMutation(
    async ({ postId, reaction }) => {
      const { data, error } = await supabase
        .from('reactions')
        .insert([{ post_id: postId, emoji: reaction }]);
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
      },
    }
  );

  const addPost = () => {
    if (newPost.trim() !== "") {
      addPostMutation.mutate(newPost);
      setNewPost("");
    }
  };

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
        ) : (
          <VStack spacing={4} width="100%">
            {posts.map((post) => (
              <Box key={post.id} p={4} borderWidth="1px" borderRadius="md" width="100%">
                <Text mb={2}>{post.text}</Text>
                <HStack spacing={4}>
                  <IconButton
                    aria-label="Like"
                    icon={<FaThumbsUp />}
                    onClick={() => addReaction(post.id, "like")}
                  />
                  <Text>{post.reactions.like}</Text>
                  <IconButton
                    aria-label="Dislike"
                    icon={<FaThumbsDown />}
                    onClick={() => addReaction(post.id, "dislike")}
                  />
                  <Text>{post.reactions.dislike}</Text>
                  <IconButton
                    aria-label="Laugh"
                    icon={<FaLaugh />}
                    onClick={() => addReaction(post.id, "laugh")}
                  />
                  <Text>{post.reactions.laugh}</Text>
                  <IconButton
                    aria-label="Sad"
                    icon={<FaSadTear />}
                    onClick={() => addReaction(post.id, "sad")}
                  />
                  <Text>{post.reactions.sad}</Text>
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