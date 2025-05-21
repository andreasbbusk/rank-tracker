'use client';

import { motion } from 'framer-motion';
import { cn } from '@/modules/core/lib/utils';
import { useEffect, useMemo, useState, useRef } from 'react';

export type Step = {
  title: string;
  description: string;
  status:
    | 'waiting'
    | 'loading'
    | 'processing'
    | 'validating'
    | 'completed'
    | 'error'
    | 'warning'
    | 'paused';
  progress?: number;
  details?: string;
};

interface MultiStepLoaderProps {
  steps: Step[];
  className?: string;
  onComplete?: (hasErrors: boolean) => void;
  artificialDelay?: number;
}

export const MultiStepLoader = ({
  steps,
  className,
  onComplete,
  artificialDelay = 0,
}: MultiStepLoaderProps) => {
  // Ref til at holde styr på om onComplete allerede er kaldt
  const hasCalledComplete = useRef(false);

  // State til at holde styr på den overordnede status
  const [overallStatus, setOverallStatus] = useState<
    'in-progress' | 'completed' | 'error'
  >('in-progress');

  // Internal representation of steps to handle artificial delay
  const [delayedSteps, setDelayedSteps] = useState<Step[]>(steps);

  // Effect to handle artificial delay on step status changes
  useEffect(() => {
    if (artificialDelay <= 0) {
      // If no delay, just use the original steps
      setDelayedSteps(steps);
      return;
    }

    // For demonstration - artificially delay each step status change
    const timeouts: NodeJS.Timeout[] = [];

    steps.forEach((step, index) => {
      if (delayedSteps[index]?.status !== step.status) {
        const timeout = setTimeout(
          () => {
            setDelayedSteps((current) => {
              const newSteps = [...current];
              newSteps[index] = { ...step };
              return newSteps;
            });
          },
          artificialDelay * (index + 1),
        );

        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [steps, artificialDelay]);

  useEffect(() => {
    // Tjek om alle trin er enten fuldført eller har fejlet
    const isAllDone = delayedSteps.every(
      (step) => step.status === 'completed' || step.status === 'error',
    );

    if (isAllDone) {
      const hasErrors = delayedSteps.some((step) => step.status === 'error');
      setOverallStatus(hasErrors ? 'error' : 'completed');

      // Kald kun onComplete, hvis det ikke allerede er kaldt for dette sæt af trin
      if (onComplete && !hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onComplete(hasErrors);
      }
    } else {
      setOverallStatus('in-progress');
      hasCalledComplete.current = false; // Nulstil, hvis vi starter forfra
    }
  }, [delayedSteps, onComplete]);

  // Function to get border color based on step status
  const getBorderColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'border-primary';
      case 'error':
        return 'border-destructive';
      case 'warning':
        return 'border-yellow-500';
      case 'paused':
        return 'border-blue-500';
      case 'loading':
      case 'processing':
      case 'validating':
        return 'border-primary/50';
      default:
        return 'border-gray-200';
    }
  };

  // Function to get background color based on step status
  const getBackgroundColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/5';
      case 'error':
        return 'bg-destructive/5';
      case 'warning':
        return 'bg-yellow-500/5';
      case 'paused':
        return 'bg-blue-500/5';
      case 'loading':
      case 'processing':
      case 'validating':
        return 'bg-primary/5';
      default:
        return 'bg-gray-50';
    }
  };

  // Memoize the steps to prevent unnecessary re-renders
  const renderedSteps = useMemo(
    () => (
      <div className={cn('flex flex-col gap-4 py-4', className)}>
        {delayedSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'relative flex rounded-lg border-2 p-4 transition-all duration-200',
              getBorderColor(step.status),
              getBackgroundColor(step.status),
            )}
          >
            <div className="flex w-full items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {step.status === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-primary"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                ) : step.status === 'error' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-destructive"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.div>
                ) : step.status === 'warning' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-yellow-500"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </motion.div>
                ) : step.status === 'paused' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-blue-500"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M10 9v6m4-6v6m-9-3a9 9 0 1118 0 9 9 0 01-18 0z"
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full border-2',
                      step.status === 'loading' ||
                        step.status === 'processing' ||
                        step.status === 'validating'
                        ? 'border-primary/50 border-t-primary'
                        : 'border-gray-300',
                      (step.status === 'loading' ||
                        step.status === 'processing' ||
                        step.status === 'validating') &&
                        'animate-spin',
                    )}
                  />
                )}
              </div>
              <div className="flex min-h-[24px] flex-1 flex-col gap-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'completed' && 'text-primary',
                    step.status === 'error' && 'text-destructive',
                    step.status === 'warning' && 'text-yellow-500',
                    step.status === 'paused' && 'text-blue-500',
                    (step.status === 'loading' ||
                      step.status === 'processing' ||
                      step.status === 'validating') &&
                      'text-primary',
                  )}
                >
                  {step.title}
                  {step.progress !== undefined && step.progress > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.round(step.progress)}%)
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    step.status === 'error'
                      ? 'text-destructive/80'
                      : 'text-gray-500',
                  )}
                >
                  {step.status === 'processing' && '⚡ '}
                  {step.status === 'validating' && '🔍 '}
                  {step.description}
                </span>
                {step.details && (
                  <span className="mt-1 text-xs italic text-gray-400">
                    {step.details}
                  </span>
                )}
              </div>

              {/* Progress indicator for loading steps */}
              {(step.status === 'loading' ||
                step.status === 'processing' ||
                step.status === 'validating') && (
                <>
                  {step.progress !== undefined && step.progress > 0 ? (
                    // Statisk fremskridtslinje baseret på det faktiske fremskridt
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: `${step.progress}%` }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                    />
                  ) : (
                    // Uendelig animation når der ikke er nogen fremskridtsprocent
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'linear',
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}

        {/* Statusindikator for hele processen */}
        {overallStatus !== 'in-progress' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mt-2 flex items-center justify-center rounded-lg border p-2',
              overallStatus === 'completed'
                ? 'border-primary bg-primary/5'
                : 'border-destructive bg-destructive/5',
            )}
          >
            <span
              className={cn(
                'text-xs font-medium',
                overallStatus === 'completed'
                  ? 'text-primary'
                  : 'text-destructive',
              )}
            >
              {overallStatus === 'completed'
                ? 'Processen er fuldført!'
                : 'Processen fuldførtes med fejl - Prøv at genindlæse siden.'}
            </span>
          </motion.div>
        )}
      </div>
    ),
    [delayedSteps, className, overallStatus],
  );

  return renderedSteps;
};
