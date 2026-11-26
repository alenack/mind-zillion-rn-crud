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
import {
  COLORS,
  CONTROLS,
  FONT_SIZES,
  RADIUS,
  SPACING,
  UI_TEXT,
} from "../constants/employeeConstants";
import {
  Employee,
  getEmployees,
  saveEmployee,
  deleteEmployee,
} from "../Client.BusinessLayer/employeeBusinessLayer";

export default function EmployeesPage() {
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

  async function loadEmployees() {
    try {
      setErrorMessage("");
      const data = await getEmployees();
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
    loadEmployees();
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

  function handleStartEdit(emp: Employee) {
    setEditingId(emp.employeeId);
    setFirstName(emp.firstName);
    setMiddleName(emp.middleName);
    setLastName(emp.lastName);
    setMobileNumber(emp.mobileNumber);
    setEmail(emp.email);
    setErrorMessage("");
  }

  async function handleSaveEmployee() {
    const trimmedMobile = mobileNumber.trim();
    const trimmedEmail = email.trim();

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage(UI_TEXT.REQUIRED_NAME_ERROR);
      return;
    }

    if (trimmedMobile && !/^\d{10}$/.test(trimmedMobile)) {
      setErrorMessage(UI_TEXT.INVALID_MOBILE_ERROR);
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage(UI_TEXT.INVALID_EMAIL_ERROR);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const result = await saveEmployee(
        {
          firstName,
          middleName,
          lastName,
          mobileNumber: trimmedMobile,
          email: trimmedEmail,
        },
        editingId
      );

      if (result.mode === "updated") {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employeeId === result.employee.employeeId ? result.employee : emp
          )
        );
      } else {
        setEmployees((prev) => [...prev, result.employee]);
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

  async function handleDeleteEmployee(id: number) {
    try {
      setErrorMessage("");
      await deleteEmployee(id);
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
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{UI_TEXT.APP_TITLE}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {loading
                ? UI_TEXT.LOADING
                : `${UI_TEXT.EMPLOYEE_COUNT_PREFIX}: ${filteredEmployees.length}`}
            </Text>
          </View>
        </View>

        <TextInput
          key={CONTROLS.SEARCH_INPUT.KEY}
          style={styles.input}
          placeholder={CONTROLS.SEARCH_INPUT.PLACEHOLDER}
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.formCard}>
          <Text style={styles.formHeading}>
            {editingId !== null ? UI_TEXT.EDIT_HEADING : UI_TEXT.ADD_HEADING}
          </Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TextInput
            key={CONTROLS.FIRST_NAME_INPUT.KEY}
            style={styles.input}
            placeholder={CONTROLS.FIRST_NAME_INPUT.PLACEHOLDER}
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            key={CONTROLS.MIDDLE_NAME_INPUT.KEY}
            style={styles.input}
            placeholder={CONTROLS.MIDDLE_NAME_INPUT.PLACEHOLDER}
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={middleName}
            onChangeText={setMiddleName}
          />
          <TextInput
            key={CONTROLS.LAST_NAME_INPUT.KEY}
            style={styles.input}
            placeholder={CONTROLS.LAST_NAME_INPUT.PLACEHOLDER}
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            key={CONTROLS.MOBILE_NUMBER_INPUT.KEY}
            style={styles.input}
            placeholder={CONTROLS.MOBILE_NUMBER_INPUT.PLACEHOLDER}
            placeholderTextColor={COLORS.TEXT_MUTED}
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
          <TextInput
            key={CONTROLS.EMAIL_INPUT.KEY}
            style={styles.input}
            placeholder={CONTROLS.EMAIL_INPUT.PLACEHOLDER}
            placeholderTextColor={COLORS.TEXT_MUTED}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              key={CONTROLS.SAVE_BUTTON.KEY}
              style={[styles.saveButton, submitting && styles.disabledButton]}
              onPress={handleSaveEmployee}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting
                  ? CONTROLS.SAVE_BUTTON.SAVING_LABEL
                  : editingId !== null
                  ? CONTROLS.SAVE_BUTTON.UPDATE_LABEL
                  : CONTROLS.SAVE_BUTTON.ADD_LABEL}
              </Text>
            </TouchableOpacity>

            {editingId !== null && (
              <TouchableOpacity
                key={CONTROLS.CANCEL_BUTTON.KEY}
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelText}>{CONTROLS.CANCEL_BUTTON.LABEL}</Text>
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
                  {item.firstName} {item.middleName} {item.lastName}
                </Text>
                <Text style={styles.empDetail}>
                  {item.mobileNumber || UI_TEXT.NO_PHONE}
                </Text>
                <Text style={styles.empDetail}>
                  {item.email || UI_TEXT.NO_EMAIL}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  key={`${CONTROLS.EDIT_BUTTON.KEY}-${item.employeeId}`}
                  style={styles.editButton}
                  onPress={() => handleStartEdit(item)}
                >
                  <Text style={styles.editText}>{CONTROLS.EDIT_BUTTON.LABEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  key={`${CONTROLS.DELETE_BUTTON.KEY}-${item.employeeId}`}
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEmployee(item.employeeId)}
                >
                  <Text style={styles.buttonText}>
                    {CONTROLS.DELETE_BUTTON.LABEL}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    padding: SPACING.LG,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.TITLE,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  countBadge: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  countBadgeText: {
    fontSize: FONT_SIZES.DETAIL,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  formCard: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.LG,
    borderRadius: RADIUS.MD,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formHeading: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: RADIUS.SM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 10,
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.INPUT,
    color: COLORS.TEXT_PRIMARY,
  },
  errorText: {
    backgroundColor: COLORS.DANGER_LIGHT,
    color: COLORS.DANGER,
    padding: SPACING.SM,
    borderRadius: RADIUS.SM,
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.ERROR,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.SM,
    marginTop: SPACING.XS,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: SPACING.XL,
    borderRadius: RADIUS.SM,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: COLORS.MUTED_BG,
    paddingVertical: 10,
    paddingHorizontal: SPACING.LG,
    borderRadius: RADIUS.SM,
  },
  cancelText: {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
    fontSize: FONT_SIZES.BUTTON,
  },
  buttonText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: "600",
    fontSize: FONT_SIZES.BUTTON,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: RADIUS.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  empName: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  empDetail: {
    fontSize: FONT_SIZES.DETAIL,
    color: COLORS.TEXT_MUTED,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.SM,
  },
  editButton: {
    backgroundColor: COLORS.EDIT_BG,
    paddingVertical: 6,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  editText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    fontSize: FONT_SIZES.BUTTON,
  },
  deleteButton: {
    backgroundColor: COLORS.DANGER,
    paddingVertical: 6,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.SM,
  },
});