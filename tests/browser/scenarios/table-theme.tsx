import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../src/surfaces";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

export default async function semanticTable(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/table", () => (
    <Table aria-label="Users">
      <TableCaption>Current users</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>Alice</TableCell>
          <TableCell>alice@example.com</TableCell>
        </TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>1 user</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ));
}
