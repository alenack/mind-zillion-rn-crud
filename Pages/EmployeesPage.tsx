import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

type ScreenMode = "list" | "form";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>("list");

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
        err instanceof Error ? err.message : UI_TEXT.API_CONNECT_ERROR
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

  function handleOpenAdd() {
    resetForm();
    setScreenMode("form");
  }

  function handleCancelForm() {
    resetForm();
    setScreenMode("list");
  }

  function handleStartEdit(emp: Employee) {
    setEditingId(emp.employeeId);
    setFirstName(emp.firstName);
    setMiddleName(emp.middleName);
    setLastName(emp.lastName);
    setMobileNumber(emp.mobileNumber);
    setEmail(emp.email);
    setErrorMessage("");
    setScreenMode("form");
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
      setScreenMode("list");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : UI_TEXT.SAVE_ERROR
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function performDelete(id: number) {
    try {
      setErrorMessage("");
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.employeeId !== id));
      if (editingId === id) {
        resetForm();
        setScreenMode("list");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : UI_TEXT.DELETE_ERROR
      );
    }
  }

  function handleDeleteEmployee(id: number) {
    if (Platform.OS === "web") {
      if (window.confirm(UI_TEXT.DELETE_CONFIRM_MESSAGE)) {
        void performDelete(id);
      }
      return;
    }

    Alert.alert(UI_TEXT.DELETE_CONFIRM_TITLE, UI_TEXT.DELETE_CONFIRM_MESSAGE, [
      { text: CONTROLS.CANCEL_BUTTON.LABEL, style: "cancel" },
      {
        text: CONTROLS.DELETE_BUTTON.LABEL,
        style: "destructive",
        onPress: () => void performDelete(id),
      },
    ]);
  }

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const fullName = [emp.firstName, emp.middleName, emp.lastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      fullName.includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.mobileNumber.includes(q)
    );
  });

  const activeSubtitle =
    screenMode === "list"
      ? UI_TEXT.LIST_SUBTITLE
      : editingId !== null
      ? UI_TEXT.EDIT_SUBTITLE
      : UI_TEXT.ADD_SUBTITLE;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Top App Header */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{UI_TEXT.APP_TITLE}</Text>
          <Text style={styles.subtitle}>{activeSubtitle}</Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {screenMode === "list" ? (
          <>
            {/* Section Title + Count Badge + Single Add Button */}
            <View style={styles.listSectionHeader}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionHeading}>
                  {UI_TEXT.EMPLOYEES_SECTION_HEADING}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {loading
                      ? UI_TEXT.LOADING
                      : `${UI_TEXT.EMPLOYEE_COUNT_PREFIX}: ${filteredEmployees.length}`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                key={CONTROLS.ADD_EMPLOYEE_BUTTON.KEY}
                style={styles.addButton}
                onPress={handleOpenAdd}
              >
                <Text style={styles.buttonText}>
                  {CONTROLS.ADD_EMPLOYEE_BUTTON.LABEL}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                key={CONTROLS.SEARCH_INPUT.KEY}
                style={styles.searchInput}
                placeholder={CONTROLS.SEARCH_INPUT.PLACEHOLDER}
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  key={CONTROLS.CLEAR_SEARCH_BUTTON.KEY}
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery("")}
                >
                  <Text style={styles.clearSearchText}>
                    {CONTROLS.CLEAR_SEARCH_BUTTON.LABEL}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Employee List or Empty State */}
            {loading ? (
              <View style={styles.emptyCard}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={styles.emptySubtitle}>
                  {UI_TEXT.LOADING_EMPLOYEES}
                </Text>
              </View>
            ) : filteredEmployees.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {searchQuery.trim()
                    ? UI_TEXT.EMPTY_SEARCH_TITLE
                    : UI_TEXT.EMPTY_LIST_TITLE}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim()
                    ? UI_TEXT.EMPTY_SEARCH_SUBTITLE
                    : UI_TEXT.EMPTY_LIST_SUBTITLE}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredEmployees}
                keyExtractor={(item) => String(item.employeeId)}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const fullName = [
                    item.firstName,
                    item.middleName,
                    item.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const initials = `${item.firstName?.[0] || ""}${
                    item.lastName?.[0] || ""
                  }`.toUpperCase();

                  return (
                    <View style={styles.rowCard}>
                      <TouchableOpacity
                        style={styles.rowMain}
                        onPress={() => handleStartEdit(item)}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {initials || UI_TEXT.AVATAR_FALLBACK}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.empName}>{fullName}</Text>
                          <Text style={styles.empDetail}>
                            {item.mobileNumber || UI_TEXT.NO_PHONE}
                          </Text>
                          <Text style={styles.empDetail}>
                            {item.email || UI_TEXT.NO_EMAIL}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          key={`${CONTROLS.EDIT_BUTTON.KEY}-${item.employeeId}`}
                          style={styles.editButton}
                          onPress={() => handleStartEdit(item)}
                        >
                          <Text style={styles.editText}>
                            {CONTROLS.EDIT_BUTTON.LABEL}
                          </Text>
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
                  );
                }}
              />
            )}
          </>
        ) : (
          /* Dedicated Add / Edit Form Screen */
          <ScrollView
            style={styles.formCard}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.formHeading}>
              {editingId !== null ? UI_TEXT.EDIT_HEADING : UI_TEXT.ADD_HEADING}
            </Text>

            <Text style={styles.fieldLabel}>
              {CONTROLS.FIRST_NAME_INPUT.PLACEHOLDER}
            </Text>
            <TextInput
              key={CONTROLS.FIRST_NAME_INPUT.KEY}
              style={styles.input}
              placeholder={CONTROLS.FIRST_NAME_INPUT.PLACEHOLDER}
              placeholderTextColor={COLORS.TEXT_MUTED}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.fieldLabel}>
              {CONTROLS.MIDDLE_NAME_INPUT.PLACEHOLDER}
            </Text>
            <TextInput
              key={CONTROLS.MIDDLE_NAME_INPUT.KEY}
              style={styles.input}
              placeholder={CONTROLS.MIDDLE_NAME_INPUT.PLACEHOLDER}
              placeholderTextColor={COLORS.TEXT_MUTED}
              value={middleName}
              onChangeText={setMiddleName}
            />

            <Text style={styles.fieldLabel}>
              {CONTROLS.LAST_NAME_INPUT.PLACEHOLDER}
            </Text>
            <TextInput
              key={CONTROLS.LAST_NAME_INPUT.KEY}
              style={styles.input}
              placeholder={CONTROLS.LAST_NAME_INPUT.PLACEHOLDER}
              placeholderTextColor={COLORS.TEXT_MUTED}
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.fieldLabel}>
              {CONTROLS.MOBILE_NUMBER_INPUT.PLACEHOLDER}
            </Text>
            <TextInput
              key={CONTROLS.MOBILE_NUMBER_INPUT.KEY}
              style={styles.input}
              placeholder={CONTROLS.MOBILE_NUMBER_INPUT.PLACEHOLDER}
              placeholderTextColor={COLORS.TEXT_MUTED}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />

            <Text style={styles.fieldLabel}>
              {CONTROLS.EMAIL_INPUT.PLACEHOLDER}
            </Text>
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
                key={CONTROLS.CANCEL_BUTTON.KEY}
                style={styles.cancelButton}
                onPress={handleCancelForm}
              >
                <Text style={styles.cancelText}>
                  {CONTROLS.CANCEL_BUTTON.LABEL}
                </Text>
              </TouchableOpacity>

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
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 0,
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG,
  },
  headerCard: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    marginBottom: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: FONT_SIZES.TITLE,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZES.DETAIL,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  countBadge: {
    flexShrink: 0,
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
  listSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.SM,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
    flex: 1,
  },
  sectionHeading: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  addButton: {
    flexShrink: 0,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.SM,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: RADIUS.SM,
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: FONT_SIZES.INPUT,
    color: COLORS.TEXT_PRIMARY,
  },
  clearSearchBtn: {
    paddingLeft: SPACING.SM,
  },
  clearSearchText: {
    fontSize: FONT_SIZES.DETAIL,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    paddingVertical: 36,
    paddingHorizontal: SPACING.LG,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.DETAIL,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: SPACING.LG,
  },
  formCard: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    backgroundColor: COLORS.SURFACE,
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
  formContent: {
    padding: SPACING.LG,
  },
  formHeading: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.DETAIL,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: RADIUS.SM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 10,
    marginBottom: SPACING.MD,
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
    justifyContent: "flex-end",
    alignItems: "center",
    gap: SPACING.SM,
    marginTop: SPACING.SM,
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
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.SM,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.SM,
  },
  avatarText: {
    fontSize: FONT_SIZES.DETAIL,
    fontWeight: "700",
    color: COLORS.PRIMARY,
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
    flexShrink: 0,
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