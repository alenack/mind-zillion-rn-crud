import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

type Employee = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
};

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      firstName: "Riddhi",
      middleName: "Anil",
      lastName: "Chavan",
      mobileNumber: "9876543210",
      email: "riddhi@example.com",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setMobileNumber("");
    setEmail("");
    setEditingId(null);
    setErrorMessage("");
  }

  function addEmployee(newRecord: Omit<Employee, "id">) {
    const created: Employee = { id: Date.now(), ...newRecord };
    setEmployees((prev) => [...prev, created]);
  }

  function updateEmployee(id: number, updatedRecord: Omit<Employee, "id">) {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedRecord } : emp))
    );
  }

  function deleteEmployee(id: number) {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    if (editingId === id) {
      resetForm();
    }
  }

  function handleStartEdit(emp: Employee) {
    setEditingId(emp.id);
    setFirstName(emp.firstName);
    setMiddleName(emp.middleName);
    setLastName(emp.lastName);
    setMobileNumber(emp.mobileNumber);
    setEmail(emp.email);
    setErrorMessage("");
  }

  function handleSaveEmployee() {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("First Name and Last Name are required.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim(),
    };

    if (editingId !== null) {
      updateEmployee(editingId, payload);
    } else {
      addEmployee(payload);
    }

    resetForm();
  }

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.middleName} ${emp.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.mobileNumber.includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Employee Management System</Text>
      <Text style={styles.subtitle}>Employees({filteredEmployees.length})</Text>

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
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmployee}>
            <Text style={styles.buttonText}>
              {editingId !== null ? "Update" : "Save"}
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>
                {item.firstName} {item.middleName} {item.lastName}
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
                onPress={() => deleteEmployee(item.id)}
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