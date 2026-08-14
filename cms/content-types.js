'use strict';

const DEFINITIONS = Object.freeze({
  page: {
    label: 'Pages', description: 'Core website and landing pages.',
    fields: [
      { name: 'template', label: 'Page template', type: 'select', options: ['standard', 'landing', 'practice-area', 'legal-guide'] },
      { name: 'parentSlug', label: 'Parent page slug', type: 'text' },
      { name: 'menuLabel', label: 'Navigation label', type: 'text' }
    ]
  },
  article: {
    label: 'Articles', description: 'Educational guides, news, and blog posts.',
    fields: [
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'publishDate', label: 'Publication date', type: 'date' },
      { name: 'readingMinutes', label: 'Reading time (minutes)', type: 'number' }
    ]
  },
  event: {
    label: 'Events', description: 'Upcoming and past community events.',
    fields: [
      { name: 'startDate', label: 'Start date and time', type: 'datetime-local', required: true },
      { name: 'endDate', label: 'End date and time', type: 'datetime-local' },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'registrationUrl', label: 'Registration URL', type: 'url' }
    ]
  },
  'team-member': {
    label: 'Team Members', description: 'Attorney and staff profiles.',
    fields: [
      { name: 'role', label: 'Job title', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
      { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' }
    ]
  },
  newsletter: {
    label: 'Newsletters', description: 'Newsletter issues and downloadable editions.',
    fields: [
      { name: 'issueDate', label: 'Issue date', type: 'date', required: true },
      { name: 'edition', label: 'Edition', type: 'text' },
      { name: 'downloadUrl', label: 'PDF or download URL', type: 'url' }
    ]
  },
  media: {
    label: 'Media', description: 'Images, documents, and reusable media records.',
    fields: [
      { name: 'fileUrl', label: 'File URL or asset path', type: 'text', required: true },
      { name: 'altText', label: 'Alternative text', type: 'text', required: true },
      { name: 'caption', label: 'Caption', type: 'textarea' },
      { name: 'credit', label: 'Credit', type: 'text' }
    ]
  },
  global: {
    label: 'Global Content', description: 'Menus, footer, CTAs, FAQs, testimonials, and shared settings.',
    fields: [
      { name: 'group', label: 'Content group', type: 'select', required: true, options: ['navigation', 'footer', 'contact', 'cta', 'faq', 'testimonial', 'result', 'settings'] },
      { name: 'key', label: 'Unique key', type: 'text', required: true },
      { name: 'displayOrder', label: 'Display order', type: 'number' }
    ]
  }
});

function clean(value, maximum = 1000) {
  return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, maximum);
}

function definition(type) {
  return DEFINITIONS[type] || DEFINITIONS.page;
}

function normaliseFields(type, source) {
  const result = {};
  for (const field of definition(type).fields) {
    const value = clean(source && source[field.name], field.type === 'textarea' ? 5000 : 1000);
    if (field.required && !value) throw new Error(`${field.label} is required.`);
    if (field.type === 'number' && value && !Number.isFinite(Number(value))) throw new Error(`${field.label} must be a number.`);
    if (field.type === 'url' && value && !/^(https?:\/\/|\/)/i.test(value)) throw new Error(`${field.label} must be an HTTP URL or site path.`);
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`${field.label} must be a valid email address.`);
    result[field.name] = field.type === 'number' && value ? Number(value) : value;
  }
  return result;
}

module.exports = { DEFINITIONS, definition, normaliseFields };
