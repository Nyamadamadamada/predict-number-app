import { Button, Heading, Stack, Container, Flex, GridItem, Text, Icon, HStack } from '@chakra-ui/react';
import { RefreshCcw, Send } from 'lucide-react';

const CheckPostCodeButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Flex mt="20px" w="full" justify="center">
      <Button
        size="lg"
        onClick={onClick}
        colorScheme="teal"
        px={8}
        py={7}
        fontWeight="bold"
        borderRadius="2xl"
        boxShadow={'md'}
        _hover={{ transform: 'translateY(-1px)' }}
        _active={{ transform: 'translateY(0)' }}
      >
        <Icon as={Send} />
        どの町へ届くかな？
      </Button>
    </Flex>
  );
};
export default CheckPostCodeButton;
