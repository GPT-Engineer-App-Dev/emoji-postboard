import { useState } from "react";
import { Container, VStack, Text, Box, Input, Button, HStack, IconButton } from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown, FaLaugh, FaSadTear } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchPosts = async () => {
  const { data, error } = await supabase.from('posts').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const addPostToDB = async (newPost) => {
  const { data, error } = await supabase.from('posts').insert([{ text: newPost, reactions: { like: 0, dislike: 0, laugh: 0, sad: 0 } }]);
  if (error) throw new Error(error.message);
  return data;
};

const updateReactionsInDB = async ({ id, reactions }) => {
  const { data, error } = await supabase.from('posts').update({ reactions }).eq('id', id);
  if (error) throw new Error(error.message);
  return data;
};

const Index = () => {
  const queryClient = useQueryClient();
  const { data: posts, isLoading, isError } = useQuery(['posts'], fetchPosts);
  const addPostMutation = useMutation(addPostToDB, {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
  const updateReactionsMutation = useMutation(updateReactionsInDB, {
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  const [newPost, setNewPost] = useState("");

  const addPost = () => {
    if (newPost.trim() !== "") {
      addPostMutation.mutate(newPost);
      setNewPost("");
    }
  };

  const addReaction = (post, reaction) => {
    const updatedReactions = { ...post.reactions, [reaction]: post.reactions[reaction] + 1 };
    updateReactionsMutation.mutate({ id: post.id, reactions: updatedReactions });
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error loading posts</Text>;

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
        <VStack spacing={4} width="100%">
          {posts.map((post) => (
            <Box key={post.id} p={4} borderWidth="1px" borderRadius="md" width="100%">
              <Text mb={2}>{post.text}</Text>
              <HStack spacing={4}>
                <IconButton
                  aria-label="Like"
                  icon={<FaThumbsUp />}
                  onClick={() => addReaction(post, "like")}
                />
                <Text>{post.reactions.like}</Text>
                <IconButton
                  aria-label="Dislike"
                  icon={<FaThumbsDown />}
                  onClick={() => addReaction(post, "dislike")}
                />
                <Text>{post.reactions.dislike}</Text>
                <IconButton
                  aria-label="Laugh"
                  icon={<FaLaugh />}
                  onClick={() => addReaction(post, "laugh")}
                />
                <Text>{post.reactions.laugh}</Text>
                <IconButton
                  aria-label="Sad"
                  icon={<FaSadTear />}
                  onClick={() => addReaction(post, "sad")}
                />
                <Text>{post.reactions.sad}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Container>
  );
};

export default Index;