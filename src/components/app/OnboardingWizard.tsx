"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  FolderPlus,
  Layers,
  Settings2,
  ArrowRight,
  X,
} from "lucide-react";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import type { ProjectCreate } from "@/lib/types";

interface OnboardingWizardProps {
  onDismiss: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Create Your First Project",
    description:
      "A project groups all FMEA activities for a product, system, or process.",
    icon: FolderPlus,
  },
  {
    id: 2,
    title: "Add Assemblies & Parts",
    description:
      "Define the product structure — assemblies contain parts where FMEA analysis is performed.",
    icon: Layers,
  },
  {
    id: 3,
    title: "Start FMEA Analysis",
    description:
      "Begin DFMEA or PFMEA analysis on your parts. Data syncs automatically.",
    icon: Settings2,
  },
];

export default function OnboardingWizard({ onDismiss }: OnboardingWizardProps) {
  const router = useRouter();
  const { createProject } = useProjects();
  const addToast = useUI((s) => s.addToast);
  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);

  // Project form fields
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [customer, setCustomer] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [modelYear, setModelYear] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      addToast({ type: "error", message: "Project name is required" });
      return;
    }

    setCreating(true);
    try {
      const data: ProjectCreate = {
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        customer: customer.trim() || undefined,
        project_number: projectNumber.trim() || undefined,
        model_year: modelYear.trim() || undefined,
      };
      const project = await createProject(data);
      addToast({
        type: "success",
        message: `Project "${project.name}" created!`,
      });
      setCurrentStep(2);
    } catch (err) {
      addToast({ type: "error", message: "Failed to create project" });
    } finally {
      setCreating(false);
    }
  };

  const handleGoToProjects = () => {
    localStorage.setItem("vinfmea_onboarding_complete", "true");
    router.push("/app/projects");
    onDismiss();
  };

  const handleGoToDfmea = () => {
    localStorage.setItem("vinfmea_onboarding_complete", "true");
    router.push("/app/dfmea");
    onDismiss();
  };

  const handleSkip = () => {
    localStorage.setItem("vinfmea_onboarding_complete", "true");
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">
            Welcome to vinFMEA Pro
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Let&apos;s get you started in just a few steps.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-8 py-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  currentStep > step.id
                    ? "bg-green-100 text-green-600"
                    : currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 size={18} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === step.id
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
              {idx < STEPS.length - 1 && (
                <ChevronRight size={16} className="mx-1 text-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="px-8 py-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create a project to organize your FMEA analysis. You can add
                more projects later.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Brake System FMEA"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Customer
                    </label>
                    <input
                      type="text"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      placeholder="e.g., Toyota"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Project Number
                    </label>
                    <input
                      type="text"
                      value={projectNumber}
                      onChange={(e) => setProjectNumber(e.target.value)}
                      placeholder="e.g., PRJ-2026-001"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Model Year
                    </label>
                    <input
                      type="text"
                      value={modelYear}
                      onChange={(e) => setModelYear(e.target.value)}
                      placeholder="e.g., 2026"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Brief description"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={creating || !projectName.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Project"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-800">
                  Project created successfully!
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Next, add assemblies (top-level groupings) and parts (components
                to analyze) to your project. Parts are where the DFMEA and PFMEA
                analyses live.
              </p>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Quick Tip
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Structure: <strong>Project</strong> &rarr;{" "}
                  <strong>Assembly</strong> &rarr; <strong>Part</strong> &rarr;{" "}
                  <strong>DFMEA / PFMEA</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip — I&apos;ll do this later
                </button>
                <button
                  onClick={handleGoToProjects}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Go to Projects
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You&apos;re all set! Navigate to a part and start your DFMEA or
                PFMEA analysis. All changes are saved in real-time and synced
                across your team.
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleGoToDfmea}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start DFMEA
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
