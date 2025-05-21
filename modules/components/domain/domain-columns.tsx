'use client';

import { Domain } from '@/modules/rank-tracker-old/types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/modules/core/lib/utils';
import { buttonVariants } from '@/modules/core/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/core/components/ui/tooltip';

export const domainColumns: ColumnDef<Domain>[] = [
  {
    accessorKey: 'display_name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Domæne
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Domænet og dets URL
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
  {
    accessorKey: 'keywords_count',
    sortingFn: 'myCustomSorting',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer justify-end"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center justify-end gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Antal søgeord
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Antallet af søgeord tilknyttet domænet
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
  {
    accessorKey: 'avg_position',
    sortingFn: 'myCustomSorting',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer justify-end"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center justify-end gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Gns. position
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Den gennemsnitlige position for alle søgeord
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
  {
    accessorKey: 'clicks',
    sortingFn: 'myCustomSorting',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer justify-end"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center justify-end gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Kliks
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Antallet af kliks på søgeresultater
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
  {
    accessorKey: 'impressions',
    sortingFn: 'myCustomSorting',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer justify-end"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center justify-end gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Eksponeringer
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Antallet af gange søgeresultater blev vist
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
  {
    accessorKey: 'top_3_keywords',
    sortingFn: 'myCustomSorting',
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="group flex cursor-pointer justify-end"
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="flex items-center justify-end gap-1">
                <span className="transtion-color w-max group-hover:text-primary">
                  Søgeord i top 3
                </span>
                {column.getSortIndex() === 0 && (
                  <span
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                      }),
                      'h-8 w-8 p-0 group-hover:bg-accent',
                    )}
                  >
                    <ArrowUpDown className={cn('h-4 w-4 text-primary')} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] border border-black/10 bg-white py-2 text-foreground shadow-sm">
                <p className="whitespace-pre-line text-left font-medium">
                  Antallet af søgeord der rangerer i top 3
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
];
