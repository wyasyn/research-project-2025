"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Printer } from "lucide-react";
import { Modal } from "@/app/dashboard/_components/admin/model";
import AddUserForm from "@/app/dashboard/_components/admin/add-user-form";

// Sample supervisor data
interface Supervisor {
  id: string;
  name: string;
  email: string;
  image: string;
}

export default function SupervisorsTable({
  organization_id = 1,
}: {
  organization_id?: number;
}) {
  // Initial supervisors data
  const [supervisors, setSupervisors] = useState<Supervisor[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@company.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@company.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      name: "Robert Wilson",
      email: "robert.wilson@company.com",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]);

  // Reference to the table component for printing
  const tableRef = useRef<HTMLDivElement>(null);

  // Function to handle deleting a supervisor
  const handleDelete = (id: string) => {
    setSupervisors(supervisors.filter((supervisor) => supervisor.id !== id));
  };

  const reactToPrintContent = () => {
    return tableRef.current;
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Supervisors List",
    onAfterPrint: () => console.log("Print completed"),
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-[768px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supervisors</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handlePrint(reactToPrintContent)}
            className="flex items-center gap-2"
            size={"sm"}
          >
            <Printer className="h-4 w-4" />
            Print to PDF
          </Button>
          <Modal title="Add Supervisor">
            <AddUserForm role="supervisor" organization_id={organization_id} />
          </Modal>
        </div>
      </div>

      <div ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supervisors.map((supervisor) => (
              <TableRow key={supervisor.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={supervisor.image} alt={supervisor.name} />
                    <AvatarFallback>
                      {supervisor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{supervisor.name}</TableCell>
                <TableCell>{supervisor.email}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(supervisor.id)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
