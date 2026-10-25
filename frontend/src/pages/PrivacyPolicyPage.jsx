export default function PrivacyPolicyPage() {
  return (
    <div className="container page-section">
      <header className="page-header">
        <h1>Privacy Policy</h1>
        <p>How Exam Portal handles information while you browse and read study material.</p>
      </header>

      <div className="prose">
        <h2>Information we collect</h2>
        <p>
          Browsing the study material library does not require an account. We do not collect names, email
          addresses or phone numbers from students. The portal records anonymous document view counts so
          that popular material can be surfaced on the home page.
        </p>

        <h2>Administrator accounts</h2>
        <p>
          Administrator accounts are created by the portal owner. Passwords are stored only as secure
          password hashes and are never kept or transmitted in plain text. Sign-in sessions are maintained
          with an HTTP-only authentication cookie.
        </p>

        <h2>Uploaded documents</h2>
        <p>
          Files uploaded by an administrator are stored on the portal&apos;s own storage and served read-only.
          Uploaded files are never executed as programme code.
        </p>

        <h2>Cookies</h2>
        <p>
          A single authentication cookie is used for the administrator session. It is HTTP-only, is not used
          for advertising, and is cleared when the administrator signs out.
        </p>

        <h2>Third-party services</h2>
        <p>
          The portal does not embed third-party advertising or analytics scripts. If external storage or a
          document conversion service is configured by the portal owner, uploaded files are transferred to
          that service only for the purpose of storage and preview generation.
        </p>

        <h2>Your choices</h2>
        <p>
          Because students are not required to register, there is no personal profile to manage. If you
          believe a document infringes your rights, contact the portal administrator and the material will be
          reviewed and removed where appropriate.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          This policy may be updated as the portal grows. The current version is always published on this
          page.
        </p>
      </div>
    </div>
  );
}
