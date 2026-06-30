import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, ChevronRight, ChevronLeft, ShieldCheck, Mail, Phone, Store, 
  UploadCloud, FileText, Image, User, Shield, AlertTriangle, Eye, ArrowRight, 
  Lock, CheckCircle2, RefreshCw, X, Search, MapPin, Landmark, Award, ChevronDown
} from 'lucide-react';

// Interface for dynamic database country and state system
interface CountryRecord {
  id: number;
  iso2: string;
  iso3: string | null;
  official_name: string;
  native_name: string | null;
  flag_emoji: string;
  phone_code: string;
  currency_code: string | null;
  currency_name: string | null;
  timezones: string | null;
  active: boolean;
  taxName?: string;
  taxPlaceholder?: string;
}

interface StateRecord {
  id: number;
  country_id: number;
  iso_state_code: string;
  official_name: string;
  admin_type: string | null;
  active: boolean;
}

interface CreatorSetupWizardProps {
  onSuccess: (shopData: {
    shopName: string;
    shopUsername: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    shopBanner: string;
    profilePic: string;
  }) => void;
  onCancel: () => void;
}

export default function CreatorSetupWizard({ onSuccess, onCancel }: CreatorSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopUsername, setShopUsername] = useState('');

  // Country & State search & selection dropdowns using database records
  const [dbCountries, setDbCountries] = useState<CountryRecord[]>([]);
  const [dbStates, setDbStates] = useState<StateRecord[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(null);
  const [selectedState, setSelectedState] = useState<StateRecord | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Phone Country Selector
  const [phoneCountry, setPhoneCountry] = useState<CountryRecord | null>(null);
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  const phoneCountryRef = useRef<HTMLDivElement>(null);

  // Email OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Username Checker states
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');

  // File Upload states
  const [bannerFile, setBannerFile] = useState<string | null>(null);
  const [bannerProgress, setBannerProgress] = useState<number>(-1);

  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [avatarProgress, setAvatarProgress] = useState<number>(-1);

  const [idFrontFile, setIdFrontFile] = useState<string | null>(null);
  const [idFrontProgress, setIdFrontProgress] = useState<number>(-1);

  const [idBackFile, setIdBackFile] = useState<string | null>(null);
  const [idBackProgress, setIdBackProgress] = useState<number>(-1);

  const [selfieFile, setSelfieFile] = useState<string | null>(null);
  const [selfieProgress, setSelfieProgress] = useState<number>(-1);

  const [taxFile, setTaxFile] = useState<string | null>(null);
  const [taxProgress, setTaxProgress] = useState<number>(-1);

  // KYC States
  const [docType, setDocType] = useState<'passport' | 'driving_license' | 'national_id'>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Agreement
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Error messaging
  const [validationError, setValidationError] = useState('');

  // Refs for tracking loaded progressive state database IDs
  const loadedCountryIdRef = useRef<number | null>(null);
  const loadedStateIdRef = useRef<number | null>(null);

  // Refs for tracking secure uploaded file keys
  const fileKeysRef = useRef<{
    avatar?: string;
    banner?: string;
    idFront?: string;
    idBack?: string;
    selfie?: string;
    tax?: string;
  }>({});

  // Refs for closing dropdowns
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (phoneCountryRef.current && !phoneCountryRef.current.contains(event.target as Node)) {
        setShowPhoneCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active countries from Global Location API
  useEffect(() => {
    let active = true;
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('/api/locations/countries');
        const data = await response.json();
        if (data.success && active) {
          setDbCountries(data.countries || []);
          if (data.countries?.length > 0 && !phoneCountry) {
            setPhoneCountry(data.countries[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch countries database:', err);
      } finally {
        if (active) setLoadingCountries(false);
      }
    };
    fetchCountries();
    return () => {
      active = false;
    };
  }, []);

  // Fetch states dynamically when country changes, reset state selection, and sync phone country by-default
  useEffect(() => {
    setSelectedState(null);
    setStateSearch('');
    setDbStates([]);

    if (selectedCountry) {
      setPhoneCountry(selectedCountry);

      const fetchStates = async () => {
        setLoadingStates(true);
        try {
          const response = await fetch(`/api/locations/states?countryId=${selectedCountry.id}`);
          const data = await response.json();
          if (data.success) {
            setDbStates(data.states || []);
          }
        } catch (err) {
          console.error('Failed to fetch states for country:', err);
        } finally {
          setLoadingStates(false);
        }
      };
      fetchStates();
    }
  }, [selectedCountry]);

  // Fetch existing progressive setup status and draft data on load
  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/creator/progress');
        const data = await response.json();
        if (!active) return;

        if (data.success && data.found) {
          const { profile, store, address, documents } = data;

          if (profile) {
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setEmail(profile.email || '');
            setPhone(profile.phone || '');
            if (profile.avatar_url) {
              setAvatarFile(profile.avatar_url);
            }

            if (profile.status === 'Submitted') {
              setCurrentStep(8);
            } else {
              setCurrentStep(profile.current_step || 1);
            }
          }

          if (address) {
            setAddress1(address.address_line1 || '');
            setAddress2(address.address_line2 || '');
            setZipCode(address.postal_code || '');
            loadedCountryIdRef.current = address.country_id;
            loadedStateIdRef.current = address.state_id;
          }

          if (store) {
            setShopName(store.store_name || '');
            setShopUsername(store.store_slug || '');
            if (store.banner_url) {
              setBannerFile(store.banner_url);
            }
          }

          if (documents && documents.length > 0) {
            const doc = documents[0];
            setDocType(doc.doc_type || 'national_id');
            setIdNumber(doc.doc_number || '');
            if (doc.file_key) {
              fileKeysRef.current.idFront = doc.file_key;
              // Securely retrieve the document temporary signed preview URL
              const signedRes = await fetch(`/api/creator/kyc-document-url?key=${encodeURIComponent(doc.file_key)}`);
              const signedData = await signedRes.json();
              if (signedData.success) {
                setIdFrontFile(signedData.url);
              }
            }
          }

          setTermsAccepted(true);
        }
      } catch (err) {
        console.error('Failed to load progressive onboarding state:', err);
      }
    };

    if (dbCountries.length > 0) {
      loadProgress();
    }
    return () => {
      active = false;
    };
  }, [dbCountries]);

  // Auto-resolve loaded progressive countries
  useEffect(() => {
    if (dbCountries.length > 0 && loadedCountryIdRef.current) {
      const match = dbCountries.find(c => c.id === loadedCountryIdRef.current);
      if (match) {
        setSelectedCountry(match);
        loadedCountryIdRef.current = null;
      }
    }
  }, [dbCountries]);

  // Auto-resolve loaded progressive states
  useEffect(() => {
    if (dbStates.length > 0 && loadedStateIdRef.current) {
      const match = dbStates.find(s => s.id === loadedStateIdRef.current);
      if (match) {
        setSelectedState(match);
        loadedStateIdRef.current = null;
      }
    }
  }, [dbStates]);

  // Username checking simulation with real-time API
  useEffect(() => {
    if (!shopUsername) {
      setUsernameStatus('idle');
      return;
    }

    const isValid = /^[a-z0-9_-]{3,20}$/.test(shopUsername);
    if (!isValid) {
      setUsernameStatus('invalid');
      return;
    }

    setCheckingUsername(true);
    const delay = setTimeout(async () => {
      try {
        const response = await fetch(`/api/creator/check-username?username=${encodeURIComponent(shopUsername)}`);
        const data = await response.json();
        if (data.status) {
          setUsernameStatus(data.status);
        } else {
          setUsernameStatus('invalid');
        }
      } catch (err) {
        console.error('Failed to check username handle:', err);
        setUsernameStatus('invalid');
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [shopUsername]);

  // Step names
  const steps = [
    { title: 'Terms', desc: 'Welcome & Rules' },
    { title: 'Identity', desc: 'Legal Name' },
    { title: 'Address', desc: 'Sovereign Location' },
    { title: 'Contact', desc: 'OTP Verify' },
    { title: 'Brand', desc: 'Shop Handles' },
    { title: 'Assets', desc: 'Identity Files' },
    { title: 'KYC & Tax', desc: 'Secure Audit' },
    { title: 'Preview', desc: 'Final Sync' }
  ];

  // Secure file uploading with XMLHttpProgress
  const handleRealUpload = async (
    field: 'banner' | 'avatar' | 'idFront' | 'idBack' | 'selfie' | 'tax',
    file: File,
    progressSetter: (p: number) => void,
    urlSetter: (url: string) => void
  ) => {
    progressSetter(0);
    setValidationError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/creator/upload?uploadType=${field}`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          progressSetter(percent);
        }
      };

      xhr.onload = () => {
        progressSetter(-1);
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              fileKeysRef.current[field] = response.file_key;
              urlSetter(response.url);
            } else {
              setValidationError(response.error || 'Upload failed.');
            }
          } catch (e) {
            setValidationError('Malformed server upload response.');
          }
        } else {
          try {
            const errorRes = JSON.parse(xhr.responseText);
            setValidationError(errorRes.error || 'Security, dimensions, or size constraints breached.');
          } catch (e) {
            setValidationError('Server returned an error during file analysis.');
          }
        }
      };

      xhr.onerror = () => {
        progressSetter(-1);
        setValidationError('Network connection error during file upload.');
      };

      xhr.send(formData);
    } catch (err: any) {
      progressSetter(-1);
      setValidationError(err.message || 'Upload execution failed.');
    }
  };

  // OTP sender simulation
  const handleSendOtp = () => {
    if (!email || !email.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(generated);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpCode === generatedOtp) {
      setEmailVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid 6-digit OTP verification code. Please check and try again.');
    }
  };

  // Navigation validation guards
  const validateStep = (step: number): boolean => {
    setValidationError('');

    switch (step) {
      case 1:
        if (!termsAccepted) {
          setValidationError('You must accept the OMYRA Merchant Agreement terms to proceed.');
          return false;
        }
        return true;
      case 2:
        if (!firstName.trim() || !lastName.trim()) {
          setValidationError('Please enter your official first name and last name matching your ID.');
          return false;
        }
        return true;
      case 3:
        if (!address1.trim() || !selectedCountry || !selectedState || !zipCode.trim()) {
          setValidationError('Please complete the full address block with valid country and state selection.');
          return false;
        }
        return true;
      case 4:
        if (!email.trim() || !phone.trim()) {
          setValidationError('Please enter both email and phone number.');
          return false;
        }
        if (!emailVerified) {
          setValidationError('Please verify your email address via the 6-digit OTP code.');
          return false;
        }
        return true;
      case 5:
        if (!shopName.trim() || !shopUsername.trim()) {
          setValidationError('Please choose a valid shop name and brand handle.');
          return false;
        }
        if (usernameStatus !== 'available') {
          setValidationError('The username handle must be verified and available.');
          return false;
        }
        return true;
      case 6:
        if (!bannerFile) {
          setValidationError('Please upload a high-quality shop banner.');
          return false;
        }
        if (!avatarFile) {
          setValidationError('Please upload your creator profile photo.');
          return false;
        }
        return true;
      case 7:
        if (!idNumber.trim()) {
          setValidationError('Please enter your official identification document number.');
          return false;
        }
        if (!idFrontFile) {
          setValidationError('Please upload the front side photo of your selected document.');
          return false;
        }
        if (docType !== 'passport' && !idBackFile) {
          setValidationError('Please upload the back side photo of your selected document.');
          return false;
        }
        if (!selfieFile) {
          setValidationError('Please upload your validation selfie with clear exposure.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      setValidationError('');
      setLoading(true);

      // Save progressive draft state automatically in backend PostgreSQL / local JSON
      try {
        let stepData: any = {};
        if (currentStep === 2) {
          stepData = { first_name: firstName, last_name: lastName };
        } else if (currentStep === 3) {
          stepData = {
            address_line1: address1,
            address_line2: address2,
            city: selectedState?.official_name || 'City',
            country_id: selectedCountry?.id,
            state_id: selectedState?.id,
            postal_code: zipCode
          };
        } else if (currentStep === 4) {
          stepData = {
            email,
            phone,
            phone_country_code: phoneCountry?.phone_code
          };
        } else if (currentStep === 5) {
          stepData = {
            store_name: shopName,
            store_slug: shopUsername,
            description: `Official sovereign storefront for ${shopName}`
          };
        } else if (currentStep === 6) {
          stepData = {
            avatar_url: avatarFile,
            banner_url: bannerFile
          };
        } else if (currentStep === 7) {
          stepData = {
            doc_type: docType,
            doc_number: idNumber,
            issuing_country_id: selectedCountry?.id,
            file_key: fileKeysRef.current.idFront,
            original_filename: 'id_front_secured.png',
            content_type: 'image/png',
            file_size: 102400
          };
        }

        if (currentStep >= 2) {
          const response = await fetch('/api/creator/save-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: currentStep, data: stepData })
          });
          const resJson = await response.json();
          if (!resJson.success) {
            setValidationError(resJson.error || 'Failed to auto-save progressive step.');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Draft auto-save bypassed due to network offline.', err);
      } finally {
        setLoading(false);
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setValidationError('');
    setCurrentStep(prev => prev - 1);
  };

  // Submit full onboarding application securely
  const handleSubmitApplication = async () => {
    setLoading(true);
    setValidationError('');
    try {
      const response = await fetch('/api/creator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        setValidationError(resData.error || 'Submission transaction failed.');
        setLoading(false);
        return;
      }

      const submissionPayload = {
        firstName,
        lastName,
        address1,
        address2,
        country: selectedCountry?.official_name || '',
        countryId: selectedCountry?.id || null,
        state: selectedState?.official_name || '',
        stateId: selectedState?.id || null,
        zipCode,
        email,
        phone: `${phoneCountry ? `${phoneCountry.phone_code} ` : ''}${phone}`,
        shopName,
        shopUsername,
        shopBanner: bannerFile || '',
        profilePic: avatarFile || '',
        idType: docType,
        idNumber,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      localStorage.setItem('omyra_creator_application_draft', JSON.stringify(submissionPayload));
      localStorage.setItem('omyra_creator_onboarding_status', 'pending');

      onSuccess(submissionPayload);
    } catch (err: any) {
      console.error('Error submitting onboarding:', err);
      setValidationError(err.message || 'Onboarding submission failed.');
    } finally {
      setLoading(false);
    }
  };

  // Filter countries on real-time search
  const filteredCountries = dbCountries.filter(c => 
    c.official_name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.iso2.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.iso3?.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Filter states on real-time search
  const filteredStates = dbStates.filter(s => 
    s.official_name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.iso_state_code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const taxName = selectedCountry?.taxName || (
    selectedCountry?.iso2 === 'IN' ? 'GSTIN (GST Number)' :
    selectedCountry?.iso2 === 'US' ? 'EIN / Tax ID / SSN' :
    selectedCountry?.iso2 === 'GB' ? 'VAT Registration Number' :
    selectedCountry?.iso2 === 'CA' ? 'GST / HST Number' :
    selectedCountry?.iso2 === 'DE' ? 'USt-IdNr (VAT ID)' :
    selectedCountry?.iso2 === 'AU' ? 'ABN (Australian Business Number)' :
    selectedCountry?.iso2 === 'JP' ? 'Corporate Number (My Number)' :
    selectedCountry?.iso2 === 'SG' ? 'UEN (Unique Entity Number)' :
    selectedCountry?.iso2 === 'FR' ? 'TVA Intracommunautaire' :
    selectedCountry?.iso2 === 'IT' ? 'Partita IVA' :
    selectedCountry?.iso2 === 'ES' ? 'NIF / CIF' :
    selectedCountry?.iso2 === 'NL' ? 'BTW-identificatienummer' :
    selectedCountry?.iso2 === 'BR' ? 'CNPJ / CPF' :
    selectedCountry?.iso2 === 'MX' ? 'RFC' :
    selectedCountry?.iso2 === 'ZA' ? 'Income Tax Reference Number' :
    selectedCountry?.iso2 === 'AE' ? 'TRN (Tax Registration Number)' :
    selectedCountry?.iso2 === 'SA' ? 'VAT Registration Number' :
    selectedCountry?.iso2 === 'KR' ? 'Business Registration Number' :
    selectedCountry?.iso2 === 'CH' ? 'UID (Business Identification)' :
    selectedCountry?.iso2 === 'SE' ? 'VAT Number' :
    selectedCountry?.iso2 === 'NZ' ? 'GST Number' :
    selectedCountry?.iso2 === 'IE' ? 'VAT Number' :
    selectedCountry?.iso2 === 'TR' ? 'KDV (VAT ID)' :
    selectedCountry?.iso2 === 'ID' ? 'NPWP (Tax ID)' :
    selectedCountry?.iso2 === 'MY' ? 'SST ID' :
    selectedCountry?.iso2 === 'PH' ? 'TIN' :
    selectedCountry?.iso2 === 'VN' ? 'Tax Code (MST)' :
    selectedCountry?.iso2 === 'TH' ? 'Tax ID' :
    selectedCountry?.iso2 === 'RU' ? 'INN' :
    selectedCountry?.iso2 === 'PL' ? 'NIP' :
    selectedCountry?.iso2 === 'NO' ? 'Organisasjonsnummer' :
    selectedCountry?.iso2 === 'DK' ? 'CVR Number' :
    selectedCountry?.iso2 === 'FI' ? 'ALV-numero (VAT)' :
    selectedCountry?.iso2 === 'AT' ? 'UID' :
    selectedCountry?.iso2 === 'BE' ? 'TVA Number' :
    selectedCountry?.iso2 === 'PT' ? 'NIF (VAT Number)' :
    selectedCountry?.iso2 === 'GR' ? 'AFM (VAT Number)' :
    selectedCountry?.iso2 === 'AR' ? 'CUIT / CUIL' :
    selectedCountry?.iso2 === 'CO' ? 'NIT / RUT' :
    selectedCountry?.iso2 === 'CL' ? 'RUT' :
    selectedCountry?.iso2 === 'PE' ? 'RUC' :
    selectedCountry?.iso2 === 'IL' ? 'VAT Number' :
    selectedCountry?.iso2 === 'PK' ? 'NTN (National Tax Number)' :
    selectedCountry?.iso2 === 'BD' ? 'BIN / TIN' :
    selectedCountry?.iso2 === 'EG' ? 'Tax Card Number' :
    selectedCountry?.iso2 === 'NG' ? 'TIN' :
    selectedCountry?.iso2 === 'KE' ? 'KRA PIN' :
    'Local Tax ID / Business Number'
  );

  const taxPlaceholder = selectedCountry?.taxPlaceholder || (
    selectedCountry?.iso2 === 'IN' ? 'e.g. 27AAAAA1111A1Z1' :
    selectedCountry?.iso2 === 'US' ? 'e.g. 12-3456789' :
    selectedCountry?.iso2 === 'GB' ? 'e.g. GB 123 4567 89' :
    selectedCountry?.iso2 === 'CA' ? 'e.g. 123456789 RT0001' :
    selectedCountry?.iso2 === 'DE' ? 'e.g. DE123456789' :
    selectedCountry?.iso2 === 'AU' ? 'e.g. 51 824 753 556' :
    selectedCountry?.iso2 === 'JP' ? 'e.g. T1234567890123' :
    selectedCountry?.iso2 === 'SG' ? 'e.g. 202612345M' :
    selectedCountry?.iso2 === 'FR' ? 'e.g. FR12345678901' :
    selectedCountry?.iso2 === 'IT' ? 'e.g. IT01234567890' :
    selectedCountry?.iso2 === 'ES' ? 'e.g. ESA1234567B' :
    selectedCountry?.iso2 === 'NL' ? 'e.g. NL012345678B01' :
    selectedCountry?.iso2 === 'BR' ? 'e.g. 12.345.678/0001-95' :
    selectedCountry?.iso2 === 'MX' ? 'e.g. ABC1234567D8' :
    selectedCountry?.iso2 === 'ZA' ? 'e.g. 9123456789' :
    selectedCountry?.iso2 === 'AE' ? 'e.g. 100234567800003' :
    selectedCountry?.iso2 === 'SA' ? 'e.g. 300123456700003' :
    selectedCountry?.iso2 === 'KR' ? 'e.g. 123-45-67890' :
    selectedCountry?.iso2 === 'CH' ? 'e.g. CHE-123.456.789 MWST' :
    selectedCountry?.iso2 === 'SE' ? 'e.g. SE123456789001' :
    selectedCountry?.iso2 === 'NZ' ? 'e.g. 12-345-678' :
    selectedCountry?.iso2 === 'IE' ? 'e.g. IE1234567T' :
    selectedCountry?.iso2 === 'TR' ? 'e.g. TR1234567890' :
    selectedCountry?.iso2 === 'ID' ? 'e.g. 01.234.567.8-901.000' :
    selectedCountry?.iso2 === 'MY' ? 'e.g. W10-1234-56789012' :
    selectedCountry?.iso2 === 'PH' ? 'e.g. 123-456-789-000' :
    selectedCountry?.iso2 === 'VN' ? 'e.g. 0123456789' :
    selectedCountry?.iso2 === 'TH' ? 'e.g. 0105556123456' :
    selectedCountry?.iso2 === 'RU' ? 'e.g. 771234567890' :
    selectedCountry?.iso2 === 'PL' ? 'e.g. PL1234567890' :
    selectedCountry?.iso2 === 'NO' ? 'e.g. 123456789 MVA' :
    selectedCountry?.iso2 === 'DK' ? 'e.g. CVR number' :
    selectedCountry?.iso2 === 'FI' ? 'e.g. FI12345678' :
    selectedCountry?.iso2 === 'AT' ? 'e.g. ATU12345678' :
    selectedCountry?.iso2 === 'BE' ? 'e.g. BE0123456789' :
    selectedCountry?.iso2 === 'PT' ? 'e.g. PT123456789' :
    selectedCountry?.iso2 === 'GR' ? 'e.g. GR123456789' :
    selectedCountry?.iso2 === 'AR' ? 'e.g. 20-12345678-9' :
    selectedCountry?.iso2 === 'CO' ? 'e.g. 123456789-0' :
    selectedCountry?.iso2 === 'CL' ? 'e.g. 12.345.678-9' :
    selectedCountry?.iso2 === 'PE' ? 'e.g. 20123456789' :
    selectedCountry?.iso2 === 'IL' ? 'e.g. 123456789' :
    selectedCountry?.iso2 === 'PK' ? 'e.g. 1234567-8' :
    selectedCountry?.iso2 === 'BD' ? 'e.g. 1234567890123' :
    selectedCountry?.iso2 === 'EG' ? 'e.g. 123-456-789' :
    selectedCountry?.iso2 === 'NG' ? 'e.g. 12345678-0001' :
    selectedCountry?.iso2 === 'KE' ? 'e.g. A012345678B' :
    'Enter tax document number'
  );

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[36px] bg-[#161618] border border-white/10 p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      
      {/* Hidden file upload inputs for R2 user contents & compliance documents */}
      <input
        type="file"
        id="banner-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('banner', file, setBannerProgress, setBannerFile);
        }}
      />
      <input
        type="file"
        id="avatar-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('avatar', file, setAvatarProgress, setAvatarFile);
        }}
      />
      <input
        type="file"
        id="idFront-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('idFront', file, setIdFrontProgress, setIdFrontFile);
        }}
      />
      <input
        type="file"
        id="idBack-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('idBack', file, setIdBackProgress, setIdBackFile);
        }}
      />
      <input
        type="file"
        id="selfie-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('selfie', file, setSelfieProgress, setSelfieFile);
        }}
      />
      <input
        type="file"
        id="tax-file-input"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealUpload('tax', file, setTaxProgress, setTaxFile);
        }}
      />

      {/* Background ambient mesh */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#D4FF5E]/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-slate-500/5 blur-[120px] pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] tracking-widest uppercase font-black">
            <ShieldCheck className="h-4 w-4 text-[#D4FF5E]" />
            Secure Verification Tunnel
          </div>
          <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight mt-1">
            OMYRA Creator <span className="text-[#D4FF5E]">Onboarding</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Follow the regulatory-compliant sandbox wizard to initialize your secure merchant credentials.
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="rounded-xl border border-white/10 hover:border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Responsive Horizontal Progress Tracker */}
      <div className="w-full overflow-x-auto scrollbar-none pb-2 border-b border-white/5">
        <div className="flex items-center min-w-[700px] justify-between px-2">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-3">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#D4FF5E] text-black shadow-[0_0_15px_rgba(212,255,94,0.4)]' 
                        : isCompleted 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase tracking-wider leading-none ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-[8px] text-slate-600 font-semibold mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-[1px] mx-2 min-w-[15px] ${isCompleted ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3 text-rose-400 text-xs font-semibold"
        >
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Main wizard step views */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME AND AGREEMENT */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D4FF5E]/10 flex items-center justify-center text-[#D4FF5E]">
                    <Award className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Join the OMYRA Elite Creator Program</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Sovereign Asset commerce layer</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  OMYRA Mall operates a highly curated, secure, decentralized digital asset catalog. By onboarding as an approved merchant, you gain access to our custom direct-checkout infrastructure, lightning-fast payouts, and global discovery routing.
                </p>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Creator Rules & Guidelines:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-[#D4FF5E] shrink-0 mt-0.5" />
                      <span><strong>Original IP Only:</strong> All source packages, scripts, audio tracks, or guides must be developed solely by you.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-[#D4FF5E] shrink-0 mt-0.5" />
                      <span><strong>Rigorous Security:</strong> Files undergo automated static scans for malicious code payloads.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-[#D4FF5E] shrink-0 mt-0.5" />
                      <span><strong>Frictionless Payouts:</strong> Direct payouts to verified routing endpoints once validation clears.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-[#D4FF5E] shrink-0 mt-0.5" />
                      <span><strong>Global Compliance:</strong> Real ID proofs required to maintain merchant integrity standards.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-[#D4FF5E] focus:ring-[#D4FF5E] shrink-0 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="accept-terms" className="text-xs text-slate-300 leading-relaxed font-medium cursor-pointer">
                    I legally declare that I am authorized to register as a digital merchant. I agree to the <span className="text-[#D4FF5E] underline font-bold">OMYRA Merchant Terms of Service</span> and understand that publishing plagiarized, licensed, or malicious code payloads results in immediate account suspension and escrow forfeiture.
                  </label>
                </div>

                {termsAccepted && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold"
                  >
                    🎉 Terms accepted! Click "Next" below to provide your official identification details and begin.
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: FIRST & LAST NAME */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Identity Anchor</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Verify Legal Identity</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Please enter your official given names exactly as written on your government-issued passport or national ID proof.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">First Name (Given Names) *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Liam James"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Last Name (Family Name) *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. O'Connor"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-[11px] text-amber-400 font-semibold flex items-start gap-2.5">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Regulatory standard mandate: Legal names are strictly used for tax-reporting validation and KYC checks. They will not be displayed to buyers on your storefront.</span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BUSINESS ADDRESS WITH COUNTRY & STATE FILTER SEARCH */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Geographic Mapping</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Business Address Coordinates</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Input your permanent tax address matching your legal residence papers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Address 1 */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Address Line 1 *</label>
                  <input
                    type="text"
                    placeholder="Street name, floor, apartment, building"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Address 2 */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Suite, unit, landmark"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                  />
                </div>

                {/* Country Selection with search */}
                <div className="space-y-1.5 relative font-sans" ref={countryRef}>
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Country *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm select-none">
                      {selectedCountry ? (selectedCountry.flag_emoji || selectedCountry.flag) : '🌐'}
                    </span>
                    <input
                      type="text"
                      placeholder={loadingCountries ? "Loading global directories..." : "Type or select country..."}
                      value={countrySearch}
                      onFocus={() => {
                        setShowCountryDropdown(true);
                        setShowStateDropdown(false);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountrySearch(val);
                        setShowCountryDropdown(true);
                        
                        // Look up exact match
                        const matched = dbCountries.find(c => c.official_name.toLowerCase() === val.trim().toLowerCase());
                        if (matched) {
                          setSelectedCountry(matched);
                        } else {
                          // Allow free-form typing immediately
                          setSelectedCountry({
                            id: -999,
                            iso2: 'CUSTOM',
                            iso3: 'CUST',
                            official_name: val,
                            native_name: val,
                            flag_emoji: '🌐',
                            phone_code: '+1',
                            active: true
                          } as any);
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-10 pr-10 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all font-semibold"
                    />
                    {loadingCountries ? (
                      <RefreshCw className="absolute right-4 top-4 h-3.5 w-3.5 text-[#D4FF5E] animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-4 top-4 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    )}
                  </div>

                  {showCountryDropdown && (
                    <div className="absolute top-[100%] left-0 w-full bg-[#1e1e21] border border-white/10 rounded-xl mt-1.5 overflow-hidden z-50 shadow-2xl max-h-[240px] flex flex-col">
                      <div className="overflow-y-auto flex-1 py-1 scrollbar-thin">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.id || c.iso2}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setCountrySearch(c.official_name);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#D4FF5E]/10 hover:text-[#D4FF5E] transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                          >
                            <span className="text-sm shrink-0">{c.flag_emoji || c.flag}</span>
                            <span>{c.official_name}</span>
                            {c.iso3 && <span className="text-[9px] font-mono font-bold text-slate-500 ml-auto bg-white/5 px-1 py-0.5 rounded">{c.iso3}</span>}
                          </button>
                        ))}
                        {countrySearch.trim() && !filteredCountries.some(c => c.official_name.toLowerCase() === countrySearch.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const customC = {
                                id: -999,
                                iso2: 'CUSTOM',
                                iso3: 'CUST',
                                official_name: countrySearch.trim(),
                                native_name: countrySearch.trim(),
                                flag_emoji: '🌐',
                                phone_code: '+1',
                                active: true
                              };
                              setSelectedCountry(customC as any);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#D4FF5E] bg-[#D4FF5E]/5 hover:bg-[#D4FF5E]/15 transition-all flex items-center gap-2 cursor-pointer font-bold border-t border-white/5"
                          >
                            <span>🌐 Use Custom Country:</span>
                            <span className="italic font-normal">"{countrySearch}"</span>
                          </button>
                        )}
                        {filteredCountries.length === 0 && !countrySearch.trim() && (
                          <div className="px-4 py-3 text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">No matching countries</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* State Selection with country conditional search */}
                <div className="space-y-1.5 relative font-sans" ref={stateRef}>
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">State / Region *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm select-none">
                      📍
                    </span>
                    <input
                      type="text"
                      placeholder={!selectedCountry ? "Select country first" : loadingStates ? "Querying regional divisions..." : "Type or select state/region..."}
                      disabled={!selectedCountry}
                      value={stateSearch}
                      onFocus={() => {
                        setShowStateDropdown(true);
                        setShowCountryDropdown(false);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStateSearch(val);
                        setShowStateDropdown(true);

                        // Look up exact match
                        const matched = dbStates.find(s => s.official_name.toLowerCase() === val.trim().toLowerCase());
                        if (matched) {
                          setSelectedState(matched);
                        } else {
                          setSelectedState({
                            id: -999,
                            country_id: selectedCountry?.id || -1,
                            iso_state_code: 'CUSTOM',
                            official_name: val,
                            admin_type: 'custom',
                            active: true
                          } as any);
                        }
                      }}
                      className={`w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-10 pr-10 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all font-semibold ${!selectedCountry ? 'opacity-40 cursor-not-allowed' : 'cursor-text'}`}
                    />
                    {loadingStates ? (
                      <RefreshCw className="absolute right-4 top-4 h-3.5 w-3.5 text-[#D4FF5E] animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-4 top-4 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    )}
                  </div>

                  {showStateDropdown && selectedCountry && (
                    <div className="absolute top-[100%] left-0 w-full bg-[#1e1e21] border border-white/10 rounded-xl mt-1.5 overflow-hidden z-50 shadow-2xl max-h-[240px] flex flex-col">
                      <div className="overflow-y-auto flex-1 py-1 scrollbar-thin">
                        {filteredStates.map((s) => (
                          <button
                            key={s.id || s.iso_state_code}
                            type="button"
                            onClick={() => {
                              setSelectedState(s);
                              setStateSearch(s.official_name);
                              setShowStateDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#D4FF5E]/10 hover:text-[#D4FF5E] transition-colors cursor-pointer font-medium"
                          >
                            {s.official_name}
                          </button>
                        ))}
                        {stateSearch.trim() && !filteredStates.some(s => s.official_name.toLowerCase() === stateSearch.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const customS = {
                                id: -999,
                                country_id: selectedCountry?.id || -1,
                                iso_state_code: 'CUSTOM',
                                official_name: stateSearch.trim(),
                                admin_type: 'custom',
                                active: true
                              };
                              setSelectedState(customS as any);
                              setShowStateDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#D4FF5E] bg-[#D4FF5E]/5 hover:bg-[#D4FF5E]/15 transition-all flex items-center gap-2 cursor-pointer font-bold border-t border-white/5"
                          >
                            <span>➕ Use Custom Region:</span>
                            <span className="italic font-normal">"{stateSearch}"</span>
                          </button>
                        )}
                        {filteredStates.length === 0 && !stateSearch.trim() && (
                          <div className="px-4 py-3 text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">No matching states</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Zip Code */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Zip / Postal Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. 400001 or 90210"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 4: CONTACT & EMAIL OTP VERIFICATION */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Telemetry Routing</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Contact Credentials</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Verify your primary contact address. OMYRA Mall sends automated billing summaries and audit credentials here.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Phone number with auto-selected country code and flag */}
                <div className="space-y-1.5 relative font-sans" ref={phoneCountryRef}>
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Phone Number *</label>
                  <div className="relative flex items-center">
                    {/* Clickable Country Flag & DialCode Badge */}
                    <button
                      type="button"
                      onClick={() => setShowPhoneCountryDropdown(!showPhoneCountryDropdown)}
                      className="absolute left-3 top-[7px] h-[34px] flex items-center gap-1.5 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-xs text-white cursor-pointer select-none"
                    >
                      <span className="text-sm shrink-0">{(phoneCountry as any)?.flag_emoji || (phoneCountry as any)?.flag || '🌐'}</span>
                      <span className="font-mono font-bold shrink-0 text-slate-300">{(phoneCountry as any)?.phone_code || (phoneCountry as any)?.dialCode || '+1'}</span>
                    </button>

                    <input
                      type="tel"
                      placeholder="e.g. 98765 43210 or (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all font-mono"
                      style={{ paddingLeft: phoneCountry ? `${48 + ((phoneCountry.flag_emoji || phoneCountry.flag) ? 22 : 0) + ((phoneCountry.phone_code || phoneCountry.dialCode || '').length * 8.5)}px` : '44px' }}
                      required
                    />
                  </div>

                  {/* Phone country mini selector dropdown */}
                  {showPhoneCountryDropdown && (
                    <div className="absolute top-[100%] left-0 w-64 bg-[#1e1e21] border border-white/10 rounded-xl mt-1.5 overflow-hidden z-50 shadow-2xl max-h-[200px] flex flex-col">
                      <div className="p-2 border-b border-white/5 bg-black/20 flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search country/code..."
                          value={phoneCountrySearch}
                          onChange={(e) => setPhoneCountrySearch(e.target.value)}
                          className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs text-white placeholder-slate-600"
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 py-1 scrollbar-thin">
                        {dbCountries.filter(c => 
                          c.official_name.toLowerCase().includes(phoneCountrySearch.toLowerCase()) ||
                          c.phone_code.includes(phoneCountrySearch) ||
                          c.iso2.toLowerCase().includes(phoneCountrySearch.toLowerCase())
                        ).map((c) => (
                          <button
                            key={c.id || c.iso2}
                            type="button"
                            onClick={() => {
                              setPhoneCountry(c);
                              setShowPhoneCountryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#D4FF5E]/10 hover:text-[#D4FF5E] transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span>{c.flag_emoji || c.flag}</span>
                              <span className="truncate max-w-[120px]">{c.official_name}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 font-bold">{c.phone_code || c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Verification Box */}
                <div className="space-y-2 border border-white/5 rounded-2xl p-5 bg-white/[0.01]">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Email Verification *</label>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="yourname@domain.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setOtpSent(false); }}
                        disabled={emailVerified}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all disabled:opacity-55"
                        required
                      />
                    </div>

                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !email.trim()}
                        className="rounded-xl px-5 py-3.5 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-[#D4FF5E] disabled:bg-white/5 disabled:text-slate-500 transition-all duration-200 cursor-pointer shrink-0"
                      >
                        {sendingOtp ? 'Sending...' : otpSent ? 'Resend Code' : 'Send OTP'}
                      </button>
                    )}
                  </div>

                  {/* Simulated OTP Display Banner */}
                  {otpSent && !emailVerified && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="mt-3 p-4 rounded-xl border border-[#D4FF5E]/20 bg-[#D4FF5E]/5 text-xs font-semibold text-[#D4FF5E] flex flex-col md:flex-row items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4.5 w-4.5 animate-spin text-[#D4FF5E] shrink-0" />
                        <span>A simulated verification email has been triggered! Please enter the secure code below.</span>
                      </div>
                      <div className="bg-[#1e1e21] border border-white/10 px-3.5 py-1.5 rounded-lg text-[13px] font-mono font-black text-white shrink-0 tracking-wider">
                        Secure OTP: <span className="text-[#D4FF5E] animate-pulse">{generatedOtp}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* OTP Input Fields */}
                  {otpSent && !emailVerified && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enter 6-Digit Code</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="rounded-xl border border-white/10 bg-black/40 py-3.5 px-4 text-xs font-mono font-black tracking-widest text-center text-white placeholder-slate-800 focus:border-[#D4FF5E] focus:outline-none w-full max-w-[200px]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white transition-colors cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-[11px] text-rose-400 font-bold uppercase tracking-wider">{otpError}</p>
                  )}

                  {emailVerified && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 font-semibold text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>Email Verified Successfully! Your profile has been bound to credentials in the OMYRA Registry.</span>
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 5: SHOP HANDLES & USERNAME CHECKER */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Store Routing</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Shop Coordinates</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Establish your digital shop name and sovereign username handle. No spaces allowed in your username handle.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Shop name */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Shop Name *</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Core Labs"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Shop username with live checker */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Unique Shop Username (Handle) *</label>
                  <input
                    type="text"
                    placeholder="e.g. nexuscore"
                    value={shopUsername}
                    onChange={(e) => setShopUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-4 text-xs font-mono font-bold text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />

                  {/* Username status labels */}
                  <div className="min-h-[20px] flex items-center mt-1">
                    {checkingUsername && (
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        checking...
                      </span>
                    )}
                    {!checkingUsername && usernameStatus === 'available' && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        available
                      </span>
                    )}
                    {!checkingUsername && usernameStatus === 'taken' && (
                      <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">
                        ✖ username is not available
                      </span>
                    )}
                    {!checkingUsername && usernameStatus === 'invalid' && (
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                        ⚠️ Must be 3-20 characters, lowercase alphanumeric only.
                      </span>
                    )}
                  </div>
                </div>

                {/* Shop URL mapping display */}
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0b] p-4.5 space-y-2">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Mapped Storefront Web Gateway (URL)</span>
                  <div className="flex items-center gap-2 font-mono text-xs font-black select-all">
                    <span className="text-slate-500">https://mall.omyra.org/</span>
                    <span className="text-[#D4FF5E] border-b border-dashed border-[#D4FF5E]/30 animate-pulse">
                      {shopUsername || 'yourhandle'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-600 font-semibold leading-normal">
                    OMYRA Routing Engine maps this directly to your sovereign storefront. Clean root resolution, no nested folders.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 6: BRAND ASSETS UPLOAD (R2 USER CONTENT BUCKET) */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Brand Assets Upload</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Storefront Presentation Assets</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Establish your shop aesthetics. These files are saved in secure public storage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Banner Upload Card */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Image className="h-4 w-4 text-slate-500" />
                      Shop Banner Banner *
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Recommended responsive dimensions: <strong>1200 x 400 px</strong>. Perfectly scales across desktop, tablet, and mobile automatically with zero clipping.
                    </p>
                  </div>

                  {bannerFile ? (
                    <div className="relative rounded-xl overflow-hidden group aspect-[3/1] border border-white/10 bg-black/40">
                      <img src={bannerFile} alt="Shop Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBannerFile(null)}
                          className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white p-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Remove Asset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={bannerProgress >= 0}
                      onClick={() => document.getElementById('banner-file-input')?.click()}
                      className="w-full aspect-[3/1] rounded-xl border border-dashed border-white/15 bg-black/20 hover:bg-white/[0.02] transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
                    >
                      {bannerProgress >= 0 ? (
                        <div className="space-y-1.5 w-4/5 text-center">
                          <p className="text-[9px] font-black text-white uppercase tracking-wider">Uploading... {bannerProgress}%</p>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4FF5E] transition-all" style={{ width: `${bannerProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-5 w-5 text-slate-500 animate-pulse" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Shop Banner</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Profile Pic Upload Card */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <User className="h-4 w-4 text-slate-500" />
                      Creator Avatar *
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Upload your square profile picture, digital logo, or personal brand mark. Saved in high-resolution PNG format.
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    {avatarFile ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden group border border-white/10 shrink-0">
                        <img src={avatarFile} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setAvatarFile(null)}
                            className="rounded-full bg-rose-600 p-1 cursor-pointer"
                          >
                            <X className="h-4.5 w-4.5 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={avatarProgress >= 0}
                        onClick={() => document.getElementById('avatar-file-input')?.click()}
                        className="h-16 w-16 rounded-full border border-dashed border-white/15 bg-black/20 hover:bg-white/[0.02] transition-colors flex flex-col items-center justify-center cursor-pointer shrink-0 disabled:opacity-55"
                      >
                        {avatarProgress >= 0 ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-[#D4FF5E]" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    )}
                    
                    <div className="flex-1 text-left">
                      <p className="text-xs text-white font-black uppercase">Source File</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        {avatarFile ? 'Asset uploaded successfully' : 'Drag and drop image or click avatar ring to trigger browse.'}
                      </p>
                      {avatarProgress >= 0 && (
                        <p className="text-[10px] text-[#D4FF5E] font-black uppercase tracking-wider mt-1">Uploading... {avatarProgress}%</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 7: KYC DOCUMENTS & TAX DETAILS (R2 SECURE DOCUMENTS BUCKET) */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">
                  <Lock className="h-4 w-4" />
                  Sovereign Identity Crypt (KYC)
                </div>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Compliant Identity Audit</h3>
                <p className="text-xs text-slate-400 font-medium font-sans">
                  KYC files are highly sensitive. All uploads are encrypted using military-grade AES-256 and stored in secure, isolated storage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Doc selection */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Document Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value as any);
                      setIdFrontFile(null);
                      setIdBackFile(null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-3 text-xs text-white focus:border-[#D4FF5E] focus:outline-none cursor-pointer"
                  >
                    <option value="national_id">National Identity Card / Aadhaar</option>
                    <option value="driving_license">Driving Licence</option>
                    <option value="passport">Sovereign Passport</option>
                  </select>
                </div>

                {/* ID Number */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Official ID Serial Number *</label>
                  <input
                    type="text"
                    placeholder="Enter number matching selected document"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3.5 px-4 text-xs font-mono text-white focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* FRONT ID Upload */}
                <div className="rounded-xl border border-white/5 bg-[#1a1a1c] p-4.5 space-y-3">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest block">Upload ID (Front Side) *</span>
                  {idFrontFile ? (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> id_front_secured.png</span>
                      <button onClick={() => setIdFrontFile(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={idFrontProgress >= 0}
                      onClick={() => document.getElementById('idFront-file-input')?.click()}
                      className="w-full py-6.5 rounded-lg border border-dashed border-white/10 bg-black/20 hover:bg-white/[0.01] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      {idFrontProgress >= 0 ? (
                        <span className="text-[9px] font-black text-[#D4FF5E] uppercase animate-pulse">Uploading Front... {idFrontProgress}%</span>
                      ) : (
                        <>
                          <UploadCloud className="h-4.5 w-4.5 text-slate-500" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Front Side</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* BACK ID Upload - Hidden for sovereign passports */}
                {docType !== 'passport' ? (
                  <div className="rounded-xl border border-white/5 bg-[#1a1a1c] p-4.5 space-y-3">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest block">Upload ID (Back Side) *</span>
                    {idBackFile ? (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> id_back_secured.png</span>
                        <button onClick={() => setIdBackFile(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={idBackProgress >= 0}
                        onClick={() => document.getElementById('idBack-file-input')?.click()}
                        className="w-full py-6.5 rounded-lg border border-dashed border-white/10 bg-black/20 hover:bg-white/[0.01] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        {idBackProgress >= 0 ? (
                          <span className="text-[9px] font-black text-[#D4FF5E] uppercase animate-pulse">Uploading Back... {idBackProgress}%</span>
                        ) : (
                          <>
                            <UploadCloud className="h-4.5 w-4.5 text-slate-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Back Side</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/5 bg-black/5 p-4.5 flex flex-col justify-center text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Passport selected. No back side document required.
                  </div>
                )}

                {/* Selfie instructions & Upload */}
                <div className="rounded-xl border border-white/5 bg-[#1a1a1c] p-4.5 space-y-4 md:col-span-2">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest block">Validation Selfie *</span>
                    <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold list-disc pl-4 mt-1.5">
                      <li>Hold ID in natural proximity if possible</li>
                      <li>No sunglasses, hats or background shadows</li>
                      <li>Clear ambient natural lighting</li>
                      <li>Legible facial boundaries</li>
                    </ul>
                  </div>

                  {selfieFile ? (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> face_liveness_selfie.png</span>
                      <button onClick={() => setSelfieFile(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={selfieProgress >= 0}
                      onClick={() => document.getElementById('selfie-file-input')?.click()}
                      className="w-full py-5 rounded-lg border border-dashed border-white/10 bg-black/20 hover:bg-white/[0.01] transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      {selfieProgress >= 0 ? (
                        <span className="text-[9px] font-black text-[#D4FF5E] uppercase animate-pulse">Uploading Selfie... {selfieProgress}%</span>
                      ) : (
                        <>
                          <UploadCloud className="h-4.5 w-4.5 text-slate-500 animate-bounce" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Liveness Selfie</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Optional Dynamic Tax Verification Coordinates */}
                <div className="rounded-xl border border-white/5 bg-[#1a1a1c] p-4.5 space-y-4 md:col-span-2">
                  <div className="space-y-1 text-left flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest block">
                        {selectedCountry ? `${taxName} (Optional)` : 'Local Tax Coordinates (Optional)'}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Provide tax certificates to bypass legal threshold locks. Shows custom taxonomy based on country of residence.
                      </p>
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={selectedCountry ? taxPlaceholder : 'Enter tax document number'}
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 px-4 text-xs font-mono text-white focus:border-[#D4FF5E] focus:outline-none transition-all"
                    />

                    {taxFile ? (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> tax_certificate_secured.pdf</span>
                        <button onClick={() => setTaxFile(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={taxProgress >= 0}
                        onClick={() => document.getElementById('tax-file-input')?.click()}
                        className="py-3.5 rounded-lg border border-dashed border-white/15 bg-black/20 hover:bg-white/[0.01] transition-colors flex flex-col items-center justify-center cursor-pointer"
                      >
                        {taxProgress >= 0 ? (
                          <span className="text-[9px] font-black text-[#D4FF5E] uppercase animate-pulse">Uploading... {taxProgress}%</span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Certificate PDF</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 8: PREVIEW & FINAL VERIFICATION SUBMISSION */}
          {currentStep === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-[#D4FF5E] uppercase tracking-wider">Final Calibration</span>
                <h3 className="text-base font-black uppercase text-white tracking-widest">Merchant Data Review</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Review all parsed registration metadata before initiating submission to the OMYRA compliance cluster.
                </p>
              </div>

              {/* Shop preview visual banner card */}
              <div className="rounded-3xl border border-white/10 bg-[#0a0a0b] overflow-hidden relative shadow-inner">
                {/* Banner */}
                <div className="h-32 bg-slate-800 relative">
                  {bannerFile && (
                    <img src={bannerFile} alt="Shop Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
                </div>

                {/* Info block */}
                <div className="p-6 pt-0 -mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-[#0a0a0b] bg-slate-900 shrink-0">
                      {avatarFile ? (
                        <img src={avatarFile} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full bg-[#D4FF5E]/10" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-tight italic leading-none">{shopName || 'Untitled Shop'}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Mapped URL: <span className="text-[#D4FF5E]">https://mall.omyra.org/{shopUsername}</span>
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                    ⏳ Application Under Audit
                  </span>
                </div>
              </div>

              {/* Data tree overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Personal & Geography */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-3 text-left">
                  <h4 className="text-[10px] font-black text-[#D4FF5E] uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Legal Owner & Mapping
                  </h4>
                  <div className="space-y-1.5 border-t border-white/5 pt-2 font-medium">
                    <p className="text-slate-400">Legal Name: <strong className="text-white">{firstName} {lastName}</strong></p>
                    <p className="text-slate-400">Residence: <strong className="text-white">{address1}{address2 ? `, ${address2}` : ''}</strong></p>
                    <p className="text-slate-400">Region: <strong className="text-white">{selectedState ? selectedState.official_name : ''}, {selectedCountry ? selectedCountry.official_name : ''} ({zipCode})</strong></p>
                  </div>
                </div>

                {/* Telemetry & Audits */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-3 text-left">
                  <h4 className="text-[10px] font-black text-[#D4FF5E] uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Telemetry & Security Sync
                  </h4>
                  <div className="space-y-1.5 border-t border-white/5 pt-2 font-medium">
                    <p className="text-slate-400">Verified Email: <strong className="text-white">{email}</strong></p>
                    <p className="text-slate-400">Phone Contact: <strong className="text-white">{phoneCountry ? `${phoneCountry.phone_code || phoneCountry.dialCode} ` : ''}{phone}</strong></p>
                    <p className="text-slate-400">Compliance Doc: <strong className="text-white">{docType.replace('_', ' ').toUpperCase()} ({idNumber.replace(/./g, '*')})</strong></p>
                    {taxNumber && (
                      <p className="text-slate-400">Tax Identification: <strong className="text-white">{taxNumber}</strong></p>
                    )}
                  </div>
                </div>

              </div>

              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 space-y-2 text-left">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Compliance Checklist Fully Validated
                </span>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  Upon submission, you will instantly receive a welcome confirmation email regarding your application. Once our compliance divisions approve the legal proof files, a Congratulations Greeting is dispatched, and your full storefront dashboard will unlock!
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div>
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="rounded-xl border border-white/10 hover:border-white/20 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        <div>
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitApplication}
              disabled={loading}
              className="rounded-xl px-7 py-3.5 text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(212,255,94,0.3)] disabled:opacity-55"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Submitting Applications...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
