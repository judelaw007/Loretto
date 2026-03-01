import type { Metadata } from "next";
import { ApplicationForm } from "./ApplicationForm";

export const metadata: Metadata = {
  title: "Apply — Loretto School of Childhood",
  description: "Submit an application for your child to attend Loretto School of Childhood",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Application</h2>
        <p className="mt-2 text-sm text-gray-600">
          Fill out the form below to apply for admission. You will receive a
          reference ID to check your application status.
        </p>
      </div>
      <ApplicationForm />
    </div>
  );
}
