import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

const API_URL = "http://localhost:5268/api/employees";

type Employee = {
  employeeId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  mobileNumber?: string | null;
  email?: string | null;
};

type EmployeePayload = {
  firstName: string;
  middleName: string | null;
  lastName: string;
  mobileNumber: string | null;
  email: string | null;
};

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchEmployees() {
    try {
      setErrorMessage("");
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to load employees (${response.status})`);
      }
      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not connect to the API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setMobileNumber("");
    setEmail("");
    setEditingId(null);
    setErrorMessage("");
  }

  async function addEmployee(payload: EmployeePayload) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to add employee (${response.status})`);
    }
    const created: Employee = await response.json();
    setEmployees((prev) => [...prev, created]);
  }

  async function updateEmployee(id: number, payload: EmployeePayload) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: id, ...payload }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update employee (${response.status})`);
    }
    setEmployees((prev) =>
      prev.map((emp) => (emp.employeeId === id ? { ...emp, ...payload } : emp))
    );
  }

  async function deleteEmployee(id: number) {
    try {
      setErrorMessage("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete employee (${response.status})`);
      }
      setEmployees((prev) => prev.filter((emp) => emp.employeeId !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not delete employee."
      );
    }
  }

  function handleStartEdit(emp: Employee) {
    setEditingId(emp.employeeId);
    setFirstName(emp.firstName);
    setMiddleName(emp.middleName ?? "");
    setLastName(emp.lastName);
    setMobileNumber(emp.mobileNumber ?? "");
    setEmail(emp.email ?? "");
    setErrorMessage("");
  }

  async function handleSaveEmployee() {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("First Name and Last Name are required.");
      return;
    }

    const payload: EmployeePayload = {
      firstName: firstName.trim(),
      middleName: middleName.trim() ? middleName.trim() : null,
      lastName: lastName.trim(),
      mobileNumber: mobileNumber.trim() ? mobileNumber.trim() : null,
      email: email.trim() ? email.trim() : null,
    };

    try {
      setSubmitting(true);
      setErrorMessage("");

      if (editingId !== null) {
        await updateEmployee(editingId, payload);
      } else {
        await addEmployee(payload);
      }

      resetForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save employee."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.middleName ?? ""} ${emp.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (emp.email ?? "").toLowerCase().includes(q) ||
      (emp.mobileNumber ?? "").includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Employee Management System</Text>
      <Text style={styles.subtitle}>
        {loading ? "Loading..." : `Employees(${filteredEmployees.length})`}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name, email, or phone..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.formCard}>
        <Text style={styles.formHeading}>
          {editingId !== null ? "Edit Employee" : "+ Add Employee"}
        </Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="First Name *"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Email ID"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.disabledButton]}
            onPress={handleSaveEmployee}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting
                ? "Saving..."
                : editingId !== null
                ? "Update"
                : "Save"}
            </Text>
          </TouchableOpacity>

          {editingId !== null && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => String(item.employeeId)}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>
                {item.firstName} {item.middleName ?? ""} {item.lastName}
              </Text>
              <Text style={styles.empDetail}>{item.mobileNumber || "No phone"}</Text>
              <Text style={styles.empDetail}>{item.email || "No email"}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleStartEdit(item)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteEmployee(item.employeeId)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#334155" },
  formCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formHeading: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  errorText: { color: "#dc2626", marginBottom: 8, fontSize: 13 },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  disabledButton: { opacity: 0.6 },
  cancelButton: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelText: { color: "#1e293b", fontWeight: "600" },
  buttonText: { color: "#ffffff", fontWeight: "600" },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  empName: { fontSize: 15, fontWeight: "bold" },
  empDetail: { fontSize: 13, color: "#475569" },
  actionButtons: { flexDirection: "row", gap: 8 },
  editButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  editText: { color: "#0f172a", fontWeight: "600" },
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});