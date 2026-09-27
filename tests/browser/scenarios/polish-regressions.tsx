import { createIsland } from "@askrjs/askr/boot";

import { Block, ButtonGroup, Card, CardTitle, EmptyState, Text } from "../../../src/components";
import { Button, Input } from "../../../src/controls";

export default function composedControls(root: HTMLElement): void {
  createIsland({
    root,
    component: () => (
      <main style="width: 220px">
        <ButtonGroup aria-label="Display density" data-testid="default-group">
          <Button size="xs">Compact</Button>
          <Button size="xs">Comfortable</Button>
          <Button size="xs">Disabled</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Segments" orientation="horizontal" data-testid="row-group">
          <Button size="xs">Day</Button>
          <Button size="xs">Week</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Format" data-testid="icon-group">
          <Button size="icon" aria-label="Bold">
            B
          </Button>
          <Button size="icon" aria-label="Italic">
            I
          </Button>
          <Button size="icon" aria-label="Underline">
            U
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Reports" data-testid="long-group">
          <Button>Detailed operational metrics for every region</Button>
          <Button>Export history</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Single" data-testid="lone-group">
          <Button>View</Button>
        </ButtonGroup>
        <Button size="xs" data-testid="reference-button">
          Compact
        </Button>
        <Card>
          <div data-testid="raw-card-content">Card content</div>
          <ul role="list" data-testid="role-card-content">
            <li>Item</li>
          </ul>
          <form data-testid="form-card-content">
            <Input aria-label="Name" data-testid="card-input" />
          </form>
          <Block gap="sm" data-testid="block-card-content">
            <h2>Overview</h2>
          </Block>
          <Text data-testid="text-card-content">Summary</Text>
          <CardTitle data-testid="title-card-content">Title</CardTitle>
          <Input aria-label="Direct" data-testid="direct-card-input" />
          <Button size="xs" data-testid="card-button">
            Compact
          </Button>
        </Card>
      </main>
    ),
  });
}

export function verticalGroups(root: HTMLElement): void {
  createIsland({
    root,
    component: () => (
      <main style="width: 240px">
        <ButtonGroup aria-label="Stack" orientation="vertical" data-testid="vertical-group">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Lone" orientation="vertical" data-testid="vertical-lone">
          <Button>Only</Button>
        </ButtonGroup>
      </main>
    ),
  });
}

export function componentProps(root: HTMLElement): void {
  createIsland({
    root,
    component: () => (
      <main style="width: 600px">
        <Card data-testid="prop-card">
          <Block maxWidth="sm" marginX="auto" data-testid="centered-block">
            Centered
          </Block>
        </Card>
        <EmptyState hide title="Hidden" data-testid="hidden-empty" />
        <EmptyState padding="none" title="Flush" data-testid="flush-empty" />
        <ButtonGroup attached={false} aria-label="Sizes">
          <Button size="lg" data-testid="grouped-large">
            Large
          </Button>
        </ButtonGroup>
        <Button size="lg" data-testid="reference-large">
          Large
        </Button>
        <div style="width: 180px">
          <ButtonGroup aria-label="Narrow" data-testid="narrow-group">
            <Button>Compact</Button>
            <Button>Comfortable</Button>
            <Button>Spacious</Button>
          </ButtonGroup>
        </div>
        <ButtonGroup aria-label="Row" orientation="horizontal" data-testid="explicit-row">
          <Button>One</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Detached" attached={false} data-testid="detached-group">
          <Button>One</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Mixed" orientation="vertical" data-testid="mixed-vertical">
          <Button>Edit document</Button>
          <Button size="icon" aria-label="More">
            +
          </Button>
        </ButtonGroup>
      </main>
    ),
  });
}
