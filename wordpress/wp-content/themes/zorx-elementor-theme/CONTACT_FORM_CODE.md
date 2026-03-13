# Contact Form 7 Code for ZORX Theme

To use the custom designed form that matches your theme, edit your Contact Form in WordPress and use the following code:

## 1. Form Tab (HTML)
Copy and paste this into the "Form" tab editor:

```html
<div class="zorx-contact-form">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="form-group">
      <label>Name</label>
      [text* your-name class:form-control placeholder "Ex. John Doe"]
    </div>
    <div class="form-group">
      <label>Email Address</label>
      [email* your-email class:form-control placeholder "Ex. john@company.com"]
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <div class="form-group">
      <label>Phone Number</label>
      [tel your-phone class:form-control placeholder "Ex. +1 (555) 000-0000"]
    </div>
     <div class="form-group">
      <label>Subject</label>
      [text your-subject class:form-control placeholder "Ex. Service Inquiry"]
    </div>
  </div>

  <div class="form-group mt-6">
    <label>Message</label>
    [textarea* your-message class:form-control rows:5 placeholder "Tell us about your project..."]
  </div>

  <div class="form-submit mt-8">
    [submit class:zorx-premium-btn "Send Message"]
  </div>
</div>
```

## 2. Additional CSS
Go to **Appearance > Customize > Additional CSS** and modify your styles to include these if they aren't already working (The button should work automatically if you are using the latest theme version).

```css
/* Contact Form 7 Styling */
.zorx-contact-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #065f46;
}

.zorx-contact-form .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: #ffffff;
    transition: all 0.2s;
    outline: none;
    color: #1f2937;
}

.zorx-contact-form .form-control:focus {
    border-color: #059669;
    box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.1);
}

.zorx-contact-form ::placeholder {
    color: #9ca3af;
}

/* Submit Button Override (Matches Header Button) */
.wpcf7 input[type="submit"].zorx-premium-btn {
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #ffffff;
    box-shadow: 0 4px 14px 0 rgba(4, 120, 87, 0.39);
    transition: all 0.3s ease;
    padding: 12px 32px;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.wpcf7 input[type="submit"].zorx-premium-btn:hover {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(4, 120, 87, 0.23);
}
```
