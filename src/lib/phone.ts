export const AUTH_COUNTRY_CODES = [
  { country: "Côte d’Ivoire", code: "+225" },
  { country: "France", code: "+33" },
  { country: "Belgique", code: "+32" },
  { country: "Suisse", code: "+41" },
  { country: "Canada", code: "+1" },
  { country: "États-Unis", code: "+1" },
  { country: "Royaume-Uni", code: "+44" },
  { country: "Sénégal", code: "+221" },
  { country: "Burkina Faso", code: "+226" },
  { country: "Mali", code: "+223" },
  { country: "Togo", code: "+228" },
  { country: "Bénin", code: "+229" },
  { country: "Guinée", code: "+224" },
  { country: "Cameroun", code: "+237" },
  { country: "Gabon", code: "+241" },
  { country: "Congo", code: "+242" },
  { country: "RDC", code: "+243" },
  { country: "Maroc", code: "+212" },
  { country: "Algérie", code: "+213" },
  { country: "Tunisie", code: "+216" },
  { country: "Afrique du Sud", code: "+27" },
  { country: "Allemagne", code: "+49" },
  { country: "Espagne", code: "+34" },
  { country: "Italie", code: "+39" },
  { country: "Portugal", code: "+351" },
  { country: "Pays-Bas", code: "+31" },
  { country: "Chine", code: "+86" },
  { country: "Inde", code: "+91" },
  { country: "Japon", code: "+81" },
  { country: "Brésil", code: "+55" },
  { country: "Australie", code: "+61" },
];

export const DEFAULT_AUTH_COUNTRY_CODE = "+225";
export const DEFAULT_AUTH_COUNTRY_CODE_LABEL = "Côte d’Ivoire +225";

export const AUTH_COUNTRY_CODE_OPTIONS = AUTH_COUNTRY_CODES.map((item) => {
  return `${item.country} ${item.code}`;
});

export function getAuthCountryCodeFromLabel(label: string) {
  return (
    AUTH_COUNTRY_CODES.find((item) => {
      return `${item.country} ${item.code}` === label;
    })?.code || DEFAULT_AUTH_COUNTRY_CODE
  );
}

export function normalizePhoneForAuth(
  value: string,
  countryCode = DEFAULT_AUTH_COUNTRY_CODE,
) {
  const rawValue = value.trim();
  let digits = rawValue.replace(/\D/g, "");
  const countryDigits = countryCode.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (!digits) {
    return "";
  }

  if (rawValue.startsWith("+") || digits.startsWith(countryDigits)) {
    return `+${digits}`;
  }

  if (countryCode !== DEFAULT_AUTH_COUNTRY_CODE && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `${countryCode}${digits}`;
}

export function isValidPhoneForAuth(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.startsWith("+") && digits.length >= 8 && digits.length <= 15;
}

export function getPhonePasswordAuthEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@phone.kidiclass.com`;
}
