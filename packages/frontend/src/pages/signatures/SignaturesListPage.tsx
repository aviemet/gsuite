import { Button, Container, Group, Title } from '@mantine/core';
import { Link } from '@tanstack/router';

export function SignaturesListPage() {
  return (
    <Container>
      <Group justify="space-between" mb="xl">
        <Title>Signatures</Title>
        <Button component={Link} to="/signatures/new">
          Create New Signature
        </Button>
      </Group>
    </Container>
  );
} 
