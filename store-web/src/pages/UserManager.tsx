import { useState, useEffect, useRef } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import UserModal from "../components/UserModal";
import ToastContainer, { useToast } from "../components/ToastContainer";
import { validateUserForm, checkUsernameExists, checkEmailExists } from "../utils/validation";

interface User {
  _id?: string;
  id?: number;
  username: string;
  email: string;
  role: "Admin" | "User";
  profile_image?: string;
  status?: "Active" | "Inactive";
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: "Admin" | "User";
  profile_image?: string;
}

const initialFormData: UserFormData = {
  username: '',
  email: '',
  password: '',
  role: 'User',
  profile_image: '',
};

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const API_BASE_URL = 'http://localhost:5001';
  const addPanelRef = useRef<HTMLDivElement | null>(null);

  // Generate object URLs for preview
  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedImageFile);
    setSelectedImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImageFile]);

  // Close handlers
  const closeAddPanel = () => {
    setShowAddPanel(false);
    setFormData(initialFormData);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    if (addPanelRef.current) addPanelRef.current.scrollTop = 0;
  };

  const closeEditPanel = () => {
    setShowEditPanel(false);
    setEditingUserId(null);
    setFormData(initialFormData);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
  };

  const handleOpenEdit = (user: User) => {
    const userId = user._id?.toString() || user.id?.toString() || '';
    console.log('Opening edit for user:', userId);
    setEditingUserId(userId);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      profile_image: user.profile_image || '',
    });
    if (user.profile_image) {
      setSelectedImagePreview(`${API_BASE_URL}/images/users/${user.profile_image}`);
    }
    setShowEditPanel(true);
  };

  // Fetch users from database
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          signal: abortController.signal
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        // Don't clear users on error - keep the existing data
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Cleanup function to abort fetch on unmount
    return () => abortController.abort();
  }, [API_BASE_URL]);

  // Handle add new user
  const handleAddSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate form data
    const validation = validateUserForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      addToast('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง', 'error', 5000);
      return;
    }
    
    setIsValidating(true);
    
    // Check for duplicate username
    const usernameCheck = await checkUsernameExists(formData.username);
    if (usernameCheck.error) {
      addToast(usernameCheck.error, 'error');
      setIsValidating(false);
      return;
    }
    if (usernameCheck.exists) {
      addToast('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น', 'error', 4000);
      setIsValidating(false);
      return;
    }
    
    // Check for duplicate email
    const emailCheck = await checkEmailExists(formData.email);
    if (emailCheck.error) {
      addToast(emailCheck.error, 'error');
      setIsValidating(false);
      return;
    }
    if (emailCheck.exists) {
      addToast('อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเลือกอีเมลอื่น', 'error', 4000);
      setIsValidating(false);
      return;
    }
    
    setIsValidating(false);

    try {
      setLoading(true);
      console.log('Starting to create user...');

      let response: Response;

      if (selectedImageFile) {
        const form = new FormData();
        form.append('profile_image', selectedImageFile);
        form.append('username', formData.username);
        form.append('email', formData.email);
        form.append('password', formData.password);
        form.append('role', formData.role);

        response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          body: form,
        });
      } else {
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

        response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create user');
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Extract user data from the response
      const newUser = responseData.data || responseData;
      console.log('User created successfully:', newUser);

      // Reset form
      setFormData(initialFormData);
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
      setShowAddPanel(false);

      // Show success toast first
      addToast('เพิ่มผู้ใช้เรียบร้อยแล้ว ชื่อผู้ใช้: ' + formData.username, 'success');
      
      // Refetch users from database to ensure data is persisted correctly
      try {
        const fetchResponse = await fetch(`${API_BASE_URL}/api/users`);
        if (fetchResponse.ok) {
          const userData = await fetchResponse.json();
          setUsers(userData);
          console.log('Users refetched after creation:', userData);
        }
      } catch (refetchErr) {
        console.error('Error refetching users:', refetchErr);
        // Fallback: add the new user to the state if refetch fails
        setUsers((prev) => {
          console.log('Fallback: Adding new user to state:', newUser);
          return [newUser, ...prev];
        });
      }

      setLoading(false);
      console.log('Loading state set to false');
    } catch (err) {
      console.error('Error creating user:', err);
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถเพิ่มผู้ใช้ได้ โปรดลองอีกครั้ง';
      addToast('เกิดข้อผิดพลาด: ' + errorMessage, 'error', 4000);
    }
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-green-100 text-green-700";
      case "User":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAvatarColor = (username: string, index: number) => {
    const colors = [
      "bg-pink-200 text-pink-700",
      "bg-blue-200 text-blue-700",
      "bg-purple-200 text-purple-700",
      "bg-green-200 text-green-700",
      "bg-yellow-200 text-yellow-700",
      "bg-orange-200 text-orange-700",
      "bg-cyan-200 text-cyan-700",
      "bg-rose-200 text-rose-700",
    ];
    return colors[index % colors.length];
  };

  const renderAvatar = (user: User, index: number) => {
    const username = user.username || 'U';
    
    if (user.profile_image) {
      return (
        <img
          src={`${API_BASE_URL}/images/users/${user.profile_image}`}
          alt={username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback to initials if image fails to load
            const firstLetter = username.charAt(0).toUpperCase();
            const colorClass = getAvatarColor(username, index);
            target.replaceWith(
              Object.assign(document.createElement('div'), {
                className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${colorClass}`,
                textContent: firstLetter
              })
            );
          }}
        />
      );
    }
    
    const firstLetter = username.charAt(0).toUpperCase();
    const colorClass = getAvatarColor(username, index);
    
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${colorClass}`}>
        {firstLetter}
      </div>
    );
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u._id || u.id?.toString() || ''));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Refetch users from database to ensure deletion is persisted
      try {
        const fetchResponse = await fetch(`${API_BASE_URL}/api/users`);
        if (fetchResponse.ok) {
          const userData = await fetchResponse.json();
          setUsers(userData);
          console.log('Users refetched after deletion:', userData);
          const deletedUser = users.find(u => (u._id?.toString() || u.id?.toString()) === id);
          addToast('ลบผู้ใช้เรียบร้อยแล้ว: ' + (deletedUser?.username || 'ผู้ใช้'), 'success');
        }
      } catch (refetchErr) {
        console.error('Error refetching users:', refetchErr);
        // Fallback: remove the user from state if refetch fails
        setUsers((prev) => prev.filter((u) => {
          const userId = u._id?.toString() || u.id?.toString();
          return userId !== id;
        }));
        addToast('ลบผู้ใช้เรียบร้อยแล้ว', 'success');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      addToast('เกิดข้อผิดพลาด: ไม่สามารถลบผู้ใช้ได้', 'error', 4000);
    }
  };

  // Handle edit user
  const handleEditSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate form data (edit mode)
    const validation = validateUserForm(formData, true);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      addToast('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง', 'error', 5000);
      return;
    }
    
    setIsValidating(true);
    
    // Check for duplicate username (exclude current user)
    const usernameCheck = await checkUsernameExists(formData.username, editingUserId || undefined);
    if (usernameCheck.error) {
      addToast(usernameCheck.error, 'error');
      setIsValidating(false);
      return;
    }
    if (usernameCheck.exists) {
      addToast('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น', 'error', 4000);
      setIsValidating(false);
      return;
    }
    
    setIsValidating(false);

    try {
      let response: Response;

      if (selectedImageFile) {
        const form = new FormData();
        form.append('profile_image', selectedImageFile);
        form.append('username', formData.username);
        form.append('email', formData.email);
        if (formData.password) {
          form.append('password', formData.password);
        }
        form.append('role', formData.role);

        console.log('Submitting edit with file, user ID:', editingUserId);
        response = await fetch(`${API_BASE_URL}/api/users/${editingUserId}`, {
          method: 'PUT',
          body: form,
        });
      } else {
        const payload: any = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          payload.password = formData.password;
        }

        console.log('Submitting edit without file, user ID:', editingUserId, 'payload:', payload);
        response = await fetch(`${API_BASE_URL}/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to update user';
        try {
          if (contentType?.includes('application/json')) {
            const errData = await response.json();
            errorMessage = errData.error || errData.message || errorMessage;
          } else {
            errorMessage = await response.text();
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const updatedUser = responseData.data || responseData;

      // Refetch users from database to ensure data is persisted correctly
      try {
        const fetchResponse = await fetch(`${API_BASE_URL}/api/users`);
        if (fetchResponse.ok) {
          const userData = await fetchResponse.json();
          setUsers(userData);
          console.log('Users refetched after update:', userData);
          addToast('อัปเดตผู้ใช้เรียบร้อยแล้ว: ' + formData.username, 'success');
        }
      } catch (refetchErr) {
        console.error('Error refetching users:', refetchErr);
        // Fallback: update the user in state if refetch fails
        setUsers((prev) =>
          prev.map((u) => {
            const userId = u._id?.toString() || u.id?.toString();
            if (userId === editingUserId) {
              return updatedUser;
            }
            return u;
          })
        );
      }

      setShowEditPanel(false);
      setEditingUserId(null);
      setFormData(initialFormData);
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถอัปเดตผู้ใช้ได้ โปรดลองอีกครั้ง';
      addToast('เกิดข้อผิดพลาด: ' + errorMessage, 'error', 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-[96px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-[#1D724A] text-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM9 20H4v-2a3 3 0 015.856-1.487"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="leading-tight">
              <h2 className="text-xl font-bold text-gray-800">
                ผู้ใช้ทั้งหมด
              </h2>
              <p className="text-gray-500">
                พบ {users.length} รายการ
              </p>
            </div>
          </div>

          {/* Add User Button */}
          <button 
            onClick={() => setShowAddPanel(true)}
            className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition">
            <FaPlus className="inline-block mr-2" /> เพิ่มผู้ใช้ใหม่
          </button>
        </div>



        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-[28%] min-w-[160px]">ชื่อ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-[32%] min-w-[200px]">อีเมล</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-[15%] min-w-[90px]">บทบาท</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-[25%] min-w-[140px]">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12 mb-4">
                        <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="4"></circle>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#1D724A" strokeWidth="4" strokeLinecap="round"></path>
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
                    </div>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-red-600">
                    เกิดข้อผิดพลาด: {error}
                  </td>
                </tr>
              )}
              {!loading && !error && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
              {!loading && paginatedUsers.map((user, index) => (
                <tr key={String(user._id || user.id)} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {renderAvatar(user, index)}
                      <div className="font-medium text-gray-900">{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 align-middle text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-6 text-sm">
                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="flex items-center gap-1 text-gray-500 hover:text-[#1D724A] transition"
                        title="แก้ไข"
                      >
                        <FaEdit className="text-[13px]" />
                        <span>แก้ไข</span>
                        
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user._id || user.id?.toString() || '')}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition"
                        title="ลบ"
                      >
                        <FaTrash className="text-[13px]" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            แสดง {(currentPage - 1) * itemsPerPage + 1} ถึง{" "}
            {Math.min(currentPage * itemsPerPage, users.length)} จาก{" "}
            {users.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition ${
                  currentPage === page
                    ? "bg-[#1D724A] text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ถัดไป
            </button>
          </div>
        </div>

        {/* User Modal - Add */}
        <UserModal
          isOpen={showAddPanel}
          onClose={closeAddPanel}
          formData={formData}
          setFormData={setFormData}
          selectedImagePreview={selectedImagePreview}
          selectedImageFile={selectedImageFile}
          setSelectedImageFile={setSelectedImageFile}
          onSubmit={handleAddSubmit}
          title="เพิ่มผู้ใช้ใหม่"
          submitButtonText="บันทึกผู้ใช้ใหม่"
        />

        {/* User Modal - Edit */}
        <UserModal
          isOpen={showEditPanel}
          onClose={closeEditPanel}
          formData={formData}
          setFormData={setFormData}
          selectedImagePreview={selectedImagePreview}
          selectedImageFile={selectedImageFile}
          setSelectedImageFile={setSelectedImageFile}
          onSubmit={handleEditSubmit}
          title="แก้ไขผู้ใช้"
          submitButtonText="อัปเดตผู้ใช้"
          isEditMode={true}
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-red-800 font-medium text-sm mb-1">ข้อมูลไม่ถูกต้อง:</h4>
                  <ul className="text-red-700 text-xs space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setValidationErrors([])}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
}
