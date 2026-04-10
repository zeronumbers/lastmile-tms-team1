"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAislesByZone, useCreateAisle, useUpdateAisle, useDeleteAisle } from "@/hooks/use-aisles";
import type { AisleDto } from "@/lib/graphql/types";

interface AisleListProps {
  zoneId: string;
}

export function AisleList({ zoneId }: AisleListProps) {
  const { data: aisles, isLoading } = useAislesByZone(zoneId);
  const createAisle = useCreateAisle();
  const updateAisle = useUpdateAisle();
  const deleteAisle = useDeleteAisle();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Loading aisles...</p>;
  }

  const aisleList: AisleDto[] = aisles ?? [];

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await createAisle.mutateAsync({ name, zoneId });
    setNewName("");
  }

  function startEditing(aisle: AisleDto) {
    setEditingId(aisle.id);
    setEditingName(aisle.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEditing(aisle: AisleDto) {
    const name = editingName.trim();
    if (!name) {
      cancelEditing();
      return;
    }
    if (name !== aisle.name) {
      await updateAisle.mutateAsync({
        id: aisle.id,
        name,
        zoneId,
        order: aisle.order,
        isActive: aisle.isActive,
      });
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this aisle?")) return;
    await deleteAisle.mutateAsync({ id, zoneId });
  }

  async function toggleActive(aisle: AisleDto) {
    await updateAisle.mutateAsync({
      id: aisle.id,
      name: aisle.name,
      zoneId,
      order: aisle.order,
      isActive: !aisle.isActive,
    });
  }

  return (
    <div className="space-y-4">
      <Separator />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Aisles</h3>
      </div>

      {/* Add aisle row */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Aisle name (e.g. A1, Main)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="max-w-xs"
        />
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!newName.trim() || createAisle.isPending}
        >
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>

      {aisleList.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No aisles yet. Add one above to get started.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aisleList.map((aisle) => (
              <TableRow key={aisle.id}>
                <TableCell>
                  {editingId === aisle.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(aisle);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="h-8 w-40"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => saveEditing(aisle)}
                        disabled={updateAisle.isPending}
                      >
                        <Check className="size-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={cancelEditing}
                      >
                        <X className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <span className="font-medium">{aisle.name}</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {aisle.label}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleActive(aisle)}
                    className={`text-xs font-medium px-2 py-1 rounded cursor-pointer ${
                      aisle.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {aisle.isActive ? "Active" : "Inactive"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingId !== aisle.id && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEditing(aisle)}
                        title="Rename"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(aisle.id)}
                      disabled={deleteAisle.isPending}
                      title="Delete"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
