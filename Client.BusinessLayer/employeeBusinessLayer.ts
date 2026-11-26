import { API_ENDPOINTS } from "../constants/employeeConstants";

export type Employee = {
  employeeId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
};

export type EmployeeInput = {
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
};

type EmployeeApiResponse = {
  employeeId?: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
};

function mapServerEmployeeToModel(raw: EmployeeApiResponse): Employee {
  return {
    employeeId: Number(raw.employeeId ?? 0),
    firstName: (raw.firstName ?? "").trim(),
    middleName: (raw.middleName ?? "").trim(),
    lastName: (raw.lastName ?? "").trim(),
    mobileNumber: (raw.mobileNumber ?? "").trim(),
    email: (raw.email ?? "").trim(),
  };
}

function mapInputToApiPayload(input: EmployeeInput, employeeId?: number) {
  return {
    ...(employeeId !== undefined ? { employeeId } : {}),
    firstName: input.firstName.trim(),
    middleName: input.middleName.trim() ? input.middleName.trim() : null,
    lastName: input.lastName.trim(),
    mobileNumber: input.mobileNumber.trim() ? input.mobileNumber.trim() : null,
    email: input.email.trim() ? input.email.trim() : null,
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch(API_ENDPOINTS.EMPLOYEES);
  if (!response.ok) {
    throw new Error(`Failed to load employees (${response.status})`);
  }
  const data: EmployeeApiResponse[] = await response.json();
  return data.map(mapServerEmployeeToModel);
}

export async function saveEmployee(
  input: EmployeeInput,
  editingId: number | null
): Promise<{ mode: "created" | "updated"; employee: Employee }> {
  const payload = mapInputToApiPayload(
    input,
    editingId !== null ? editingId : undefined
  );

  if (editingId !== null) {
    const response = await fetch(`${API_ENDPOINTS.EMPLOYEES}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to update employee (${response.status})`);
    }
    const updatedEmployee: Employee = {
      employeeId: editingId,
      firstName: input.firstName.trim(),
      middleName: input.middleName.trim(),
      lastName: input.lastName.trim(),
      mobileNumber: input.mobileNumber.trim(),
      email: input.email.trim(),
    };
    return { mode: "updated", employee: updatedEmployee };
  }

  const response = await fetch(API_ENDPOINTS.EMPLOYEES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to add employee (${response.status})`);
  }
  const rawCreated: EmployeeApiResponse = await response.json();
  return {
    mode: "created",
    employee: mapServerEmployeeToModel(rawCreated),
  };
}

export async function deleteEmployee(employeeId: number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete employee (${response.status})`);
  }
}