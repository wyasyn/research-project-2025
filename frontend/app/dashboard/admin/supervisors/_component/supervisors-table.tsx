"use client";

import { useRef } from "react";
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
import { deleteUser } from "@/lib/actions/users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Sample supervisor data
interface Supervisor {
  id: number;
  name: string;
  email: string;
  image_url: string;
  role: "supervisor" | "user" | "admin";
}

export default function SupervisorsTable({
  supervisors,
  organizationId,
}: {
  supervisors: Supervisor[];
  organizationId: number;
}) {
  // Reference to the table component for printing
  const tableRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Function to handle deleting a supervisor
  const handleDelete = async (id: number) => {
    try {
      const { error, success } = await deleteUser(id);
      if (error) {
        toast.error(error);
        return;
      }
      if (!success) {
        toast.error("Failed to delete Supervisor");
        return;
      }
      toast.success("Supervisor deleted successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete Supervisor");
    }
  };

  const reactToPrintContent = () => {
    return tableRef.current;
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Supervisors List",
    onAfterPrint: () => console.log("Print completed"),
  });

  if (supervisors && supervisors.length === 0) {
    return (
      <section className="container mx-auto py-8 px-4 max-w-[768px]">
        <div className="flex justify-end items-center mb-6 w-full">
          <Modal title="Add Supervisor">
            <AddUserForm role="supervisor" organization_id={organizationId} />
          </Modal>
        </div>
        <p>No supervisors found. Please add to view.</p>
      </section>
    );
  }

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
            <AddUserForm role="supervisor" organization_id={organizationId} />
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
                    <AvatarImage
                      src={supervisor.image_url}
                      alt={supervisor.name}
                      className="object-cover"
                    />
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
