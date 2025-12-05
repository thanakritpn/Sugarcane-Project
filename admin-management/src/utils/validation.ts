// Utility functions for form validation

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRules {
  username: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    patternMessage: string;
  };
  email: {
    pattern: RegExp;
    patternMessage: string;
  };
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
  };
  shopName: {
    minLength: number;
    maxLength: number;
  };
  phone: {
    pattern: RegExp;
    patternMessage: string;
  };
}

export const validationRules: ValidationRules = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    patternMessage: 'ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ, ตัวเลข และ _ เท่านั้น'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'รูปแบบอีเมลไม่ถูกต้อง'
  },
  password: {
    minLength: 8,
    maxLength: 50,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  },
  shopName: {
    minLength: 2,
    maxLength: 50
  },
  phone: {
    pattern: /^[0-9]{9,10}$/,
    patternMessage: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'
  }
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!username || username.trim() === '') {
    errors.push('กรุณากรอกชื่อผู้ใช้');
    return { isValid: false, errors };
  }
  
  if (username.length < validationRules.username.minLength) {
    errors.push(`ชื่อผู้ใช้ต้องมีอย่างน้อย ${validationRules.username.minLength} ตัวอักษร`);
  }
  
  if (username.length > validationRules.username.maxLength) {
    errors.push(`ชื่อผู้ใช้ต้องไม่เกิน ${validationRules.username.maxLength} ตัวอักษร`);
  }
  
  if (!validationRules.username.pattern.test(username)) {
    errors.push(validationRules.username.patternMessage);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || email.trim() === '') {
    errors.push('กรุณากรอกอีเมล');
    return { isValid: false, errors };
  }
  
  if (!validationRules.email.pattern.test(email)) {
    errors.push(validationRules.email.patternMessage);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Password validation
export const validatePassword = (password: string, isEditMode: boolean = false): ValidationResult => {
  const errors: string[] = [];
  
  // In edit mode, password is optional
  if (isEditMode && (!password || password.trim() === '')) {
    return { isValid: true, errors };
  }
  
  if (!password || password.trim() === '') {
    errors.push('กรุณากรอกรหัสผ่าน');
    return { isValid: false, errors };
  }
  
  if (password.length < validationRules.password.minLength) {
    errors.push(`รหัสผ่านต้องมีอย่างน้อย ${validationRules.password.minLength} ตัวอักษร`);
  }
  
  if (password.length > validationRules.password.maxLength) {
    errors.push(`รหัสผ่านต้องไม่เกิน ${validationRules.password.maxLength} ตัวอักษร`);
  }
  
  if (validationRules.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  }
  
  if (validationRules.password.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
  }
  
  if (validationRules.password.requireNumber && !/[0-9]/.test(password)) {
    errors.push('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');
  }
  
  if (validationRules.password.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&* เป็นต้น)');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Shop name validation
export const validateShopName = (shopName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!shopName || shopName.trim() === '') {
    errors.push('กรุณากรอกชื่อร้านค้า');
    return { isValid: false, errors };
  }
  
  if (shopName.length < validationRules.shopName.minLength) {
    errors.push(`ชื่อร้านค้าต้องมีอย่างน้อย ${validationRules.shopName.minLength} ตัวอักษร`);
  }
  
  if (shopName.length > validationRules.shopName.maxLength) {
    errors.push(`ชื่อร้านค้าต้องไม่เกิน ${validationRules.shopName.maxLength} ตัวอักษร`);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Phone validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || phone.trim() === '') {
    errors.push('กรุณากรอกหมายเลขโทรศัพท์');
    return { isValid: false, errors };
  }
  
  if (!validationRules.phone.pattern.test(phone)) {
    errors.push(validationRules.phone.patternMessage);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || value.trim() === '') {
    errors.push(`กรุณากรอก${fieldName}`);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Comprehensive form validation
export const validateUserForm = (formData: {
  username: string;
  email: string;
  password: string;
  role: string;
}, isEditMode: boolean = false): ValidationResult => {
  const allErrors: string[] = [];
  
  const usernameValidation = validateUsername(formData.username);
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password, isEditMode);
  const roleValidation = validateRequired(formData.role, 'บทบาท');
  
  allErrors.push(...usernameValidation.errors);
  allErrors.push(...emailValidation.errors);
  allErrors.push(...passwordValidation.errors);
  allErrors.push(...roleValidation.errors);
  
  return { isValid: allErrors.length === 0, errors: allErrors };
};

export const validateShopForm = (formData: {
  username: string;
  email: string;
  password: string;
  shopName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
}, isEditMode: boolean = false): ValidationResult => {
  const allErrors: string[] = [];
  
  const usernameValidation = validateUsername(formData.username);
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password, isEditMode);
  const shopNameValidation = validateShopName(formData.shopName);
  const phoneValidation = validatePhone(formData.phone);
  const addressValidation = validateRequired(formData.address, 'ที่อยู่');
  const districtValidation = validateRequired(formData.district, 'อำเภอ');
  const provinceValidation = validateRequired(formData.province, 'จังหวัด');
  
  allErrors.push(...usernameValidation.errors);
  allErrors.push(...emailValidation.errors);
  allErrors.push(...passwordValidation.errors);
  allErrors.push(...shopNameValidation.errors);
  allErrors.push(...phoneValidation.errors);
  allErrors.push(...addressValidation.errors);
  allErrors.push(...districtValidation.errors);
  allErrors.push(...provinceValidation.errors);
  
  return { isValid: allErrors.length === 0, errors: allErrors };
};

// Check for duplicate username via API
export const checkUsernameExists = async (username: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> => {
  try {
    const response = await fetch(`http://localhost:5001/api/users/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, excludeId }),
    });
    
    if (!response.ok) {
      return { exists: false, error: 'ไม่สามารถตรวจสอบชื่อผู้ใช้ได้' };
    }
    
    const data = await response.json();
    return { exists: data.exists };
  } catch (error) {
    return { exists: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้' };
  }
};

// Check for duplicate email via API
export const checkEmailExists = async (email: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> => {
  try {
    const response = await fetch(`http://localhost:5001/api/users/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, excludeId }),
    });
    
    if (!response.ok) {
      return { exists: false, error: 'ไม่สามารถตรวจสอบอีเมลได้' };
    }
    
    const data = await response.json();
    return { exists: data.exists };
  } catch (error) {
    return { exists: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล' };
  }
};