"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  addDocument,
  queryDocuments,
  orderBy,
  serverTimestamp,
} from "@loretto/firebase-config";
import type {
  School,
  ApplicationFormData,
  ApplicationFormChild,
} from "@loretto/shared-types";

const emptyChild: ApplicationFormChild = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  previousSchool: "",
  classAppliedFor: "",
};

export function ApplicationForm() {
  const [schools, setSchools] = useState<(School & { id: string })[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [children, setChildren] = useState<ApplicationFormChild[]>([{ ...emptyChild }]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchools() {
      try {
        const results = await queryDocuments<School>("schools", orderBy("name"));
        setSchools(results);
      } catch {
        setError("Failed to load schools. Please refresh the page.");
      } finally {
        setLoadingSchools(false);
      }
    }
    loadSchools();
  }, []);

  function updateChild(index: number, field: keyof ApplicationFormChild, value: string) {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function addChild() {
    setChildren((prev) => [...prev, { ...emptyChild }]);
  }

  function removeChild(index: number) {
    if (children.length <= 1) return;
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate at least one child has required fields
      const validChildren = children.every(
        (c) => c.firstName && c.lastName && c.dateOfBirth && c.gender && c.classAppliedFor,
      );
      if (!validChildren) {
        setError("Please fill in all required fields for each child.");
        setSubmitting(false);
        return;
      }

      const formData: ApplicationFormData = {
        parentName,
        parentEmail,
        parentPhone,
        schoolId,
        children: children.map((c) => ({
          firstName: c.firstName,
          lastName: c.lastName,
          dateOfBirth: c.dateOfBirth,
          gender: c.gender,
          previousSchool: c.previousSchool || undefined,
          classAppliedFor: c.classAppliedFor,
        })),
      };

      const id = await addDocument("applications", {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setApplicationId(id);
    } catch {
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (applicationId) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mb-4 text-4xl">&#10003;</div>
        <h3 className="text-xl font-bold text-gray-900">Application Submitted</h3>
        <p className="mt-2 text-sm text-gray-600">
          Your application has been submitted successfully. Please save your
          reference ID below.
        </p>
        <div className="mt-4 rounded-md bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">Reference ID</p>
          <p className="font-mono text-lg font-bold text-gray-900">{applicationId}</p>
        </div>
        <a
          href="/apply/status"
          className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Check application status &rarr;
        </a>
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* School Selection */}
      <fieldset className="rounded-lg border bg-white p-6">
        <legend className="px-2 text-sm font-semibold text-gray-900">School</legend>
        <div>
          <label htmlFor="school" className={labelClass}>
            Select School <span className="text-red-500">*</span>
          </label>
          {loadingSchools ? (
            <p className="mt-1 text-sm text-gray-400">Loading schools...</p>
          ) : (
            <select
              id="school"
              required
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className={inputClass}
              disabled={submitting}
            >
              <option value="">Choose a school...</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.branch}
                </option>
              ))}
            </select>
          )}
        </div>
      </fieldset>

      {/* Parent Details */}
      <fieldset className="rounded-lg border bg-white p-6">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Parent / Guardian Details
        </legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="parentName" className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="parentName"
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Mr. Adeyemi Ogundimu"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="parentEmail" className={labelClass}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="parentEmail"
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className={inputClass}
              placeholder="parent@example.com"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="parentPhone" className={labelClass}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="parentPhone"
              type="tel"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className={inputClass}
              placeholder="+234..."
              disabled={submitting}
            />
          </div>
        </div>
      </fieldset>

      {/* Children */}
      {children.map((child, index) => (
        <fieldset key={index} className="rounded-lg border bg-white p-6">
          <legend className="px-2 text-sm font-semibold text-gray-900">
            Child {index + 1}
            {children.length > 1 && (
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="ml-3 text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={child.firstName}
                onChange={(e) => updateChild(index, "firstName", e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label className={labelClass}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={child.lastName}
                onChange={(e) => updateChild(index, "lastName", e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label className={labelClass}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={child.dateOfBirth}
                onChange={(e) => updateChild(index, "dateOfBirth", e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label className={labelClass}>
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={child.gender}
                onChange={(e) => updateChild(index, "gender", e.target.value)}
                className={inputClass}
                disabled={submitting}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Previous School</label>
              <input
                type="text"
                value={child.previousSchool}
                onChange={(e) => updateChild(index, "previousSchool", e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label className={labelClass}>
                Class Applied For <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={child.classAppliedFor}
                onChange={(e) => updateChild(index, "classAppliedFor", e.target.value)}
                className={inputClass}
                placeholder="e.g. Nursery 1, Primary 3"
                disabled={submitting}
              />
            </div>
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={addChild}
        className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
        disabled={submitting}
      >
        + Add Another Child
      </button>

      <button
        type="submit"
        disabled={submitting || loadingSchools}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
