
'use client';

import { useState, useEffect, useTransition } from 'react';
import { format } from 'date-fns';
import { getAppointmentRequests, deleteAppointmentRequest } from './actions';
import * as XLSX from 'xlsx';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Mail, Trash2, Loader2, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

export interface AppointmentData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredArtist?: string;
  tattooStyle?: string;
  tattooDescription: string;
  budgetRange?: string;
  preferredTimeframe?: string;
  createdAt: string; // Stored as ISO string
}

const AppointmentSkeleton = () => (
    <TableRow>
      <TableCell className="w-[150px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[180px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[150px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[120px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[150px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[150px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="w-[150px]"><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="text-right w-[100px]"><Skeleton className="h-9 w-full" /></TableCell>
    </TableRow>
);


export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  useEffect(() => {
    async function loadAppointments() {
      if (!user) return;
      setIsLoading(true);
      try {
        const idToken = await user.getIdToken();
        const data = await getAppointmentRequests(idToken);
        setAppointments(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load appointment requests.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointments();
  }, [user]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      if (!user) {
         toast({ variant: 'destructive', title: 'Error', description: 'You are not authenticated.' });
         return;
      }
      const idToken = await user.getIdToken();
      const result = await deleteAppointmentRequest(id, idToken);
      if (result.success) {
        setAppointments((prev) => prev.filter((app) => app.id !== id));
        toast({
          title: 'Success!',
          description: 'Appointment request has been deleted.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to delete the request.',
        });
      }
    });
  };

  const handleExcelExport = () => {
    const dataToExport = appointments.map(app => ({
      'Date': format(new Date(app.createdAt), 'yyyy-MM-dd HH:mm'),
      'Full Name': app.fullName,
      'Email': app.email,
      'Phone': app.phone,
      'Date of Birth': app.dateOfBirth || 'N/A',
      'Description': app.tattooDescription,
      'Artist': app.preferredArtist || 'N/A',
      'Style': app.tattooStyle || 'N/A',
      'Budget': app.budgetRange || 'N/A',
      'Timeframe': app.preferredTimeframe || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    XLSX.writeFile(workbook, 'appointment_requests.xlsx');
  }
  
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
            <Mail className="h-8 w-8 text-orange-600" />
            <div>
            <h1 className="text-2xl font-bold">Appointment Requests</h1>
            <p className="text-muted-foreground">
                Manage and review all submitted appointment requests.
            </p>
            </div>
        </div>
        <Button onClick={handleExcelExport} disabled={isLoading || appointments.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Excel
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[180px]">Name / Email</TableHead>
              <TableHead className="w-[150px]">Phone / DoB</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Artist</TableHead>
              <TableHead className="w-[150px]">Style</TableHead>
              <TableHead className="w-[150px]">Budget</TableHead>
              <TableHead className="w-[150px]">Timeframe</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [...Array(5)].map((_, i) => <AppointmentSkeleton key={i} />)
            ) : appointments.length > 0 ? (
              appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {format(new Date(app.createdAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{app.fullName}</div>
                    <div className="text-sm text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{app.phone}</div>
                    <div className="text-sm text-muted-foreground">{app.dateOfBirth || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {app.tattooDescription}
                  </TableCell>
                   <TableCell>
                    <Badge variant={app.preferredArtist === 'No preference' ? "secondary" : "default"}>{app.preferredArtist || 'N/A'}</Badge>
                   </TableCell>
                  <TableCell>{app.tattooStyle || 'N/A'}</TableCell>
                  <TableCell>{app.budgetRange || 'N/A'}</TableCell>
                  <TableCell>{app.preferredTimeframe || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the appointment request.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(app.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Yes, delete it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No appointment requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    
