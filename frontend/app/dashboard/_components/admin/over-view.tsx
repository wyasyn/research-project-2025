import React, { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupervisorsList from "./supervisors";
import UsersList from "./UsersData";
import { Modal } from "./model";
import AddUserForm from "./add-user-form";
import { getOrganizationDetails } from "@/lib/actions/organization";

import OverviewStats from "./overviewStats";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default async function AdminOverView() {
  const { id, name, description, error } = await getOrganizationDetails();
  if (error) {
    return <p>Error occurred while fetching data</p>;
  }
  if (!id || !name || !description) return;
  return (
    <div className="scroll-m-20 grid grid-cols-1 gap-8 md:gap-14 md:grid-cols-2">
      <div>
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {name}
        </h1>
        <p className="scroll-m-20 my-3  md:my-8 max-w-[50ch]">{description}</p>
        <Suspense fallback={<LoadingSkeleton />}>
          <OverviewStats />
        </Suspense>
      </div>

      <section className=" mt-10 md:mt-20 ">
        <Modal title="Add Supervisor">
          <AddUserForm role="supervisor" organization_id={id} />
        </Modal>
        <Tabs defaultValue="tab-1" className="items-start">
          <TabsList>
            <TabsTrigger value="tab-1">Supervisors</TabsTrigger>
            <TabsTrigger value="tab-2">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">
            <Suspense fallback={<LoadingSkeleton />}>
              <SupervisorsList />
            </Suspense>
          </TabsContent>
          <TabsContent value="tab-2">
            <Suspense fallback={<LoadingSkeleton />}>
              <UsersList />
            </Suspense>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
