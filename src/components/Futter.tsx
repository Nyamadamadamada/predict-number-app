import { Flex, Text } from '@chakra-ui/react';

const Futter = () => {
  return (
    <Flex as="footer" w="full" justify="center" align="center" mt="60px" mb="20px" gap={2} opacity={0.7} fontSize="sm">
      <img src="/predict-number-app/img/github-mark.png" alt="Logo" style={{ width: '16px', height: '16px' }} />
      <Text>
        <a
          href="https://github.com/Nyamadamadamada/predict-number-app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline' }}
        >
          https://github.com/Nyamadamadamada/predict-number-app
        </a>
      </Text>
    </Flex>
  );
};

export default Futter;
