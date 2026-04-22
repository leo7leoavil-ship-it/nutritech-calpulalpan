'use client';

interface FormStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Motivo' },
  { id: 2, name: 'Antropometría' },
  { id: 3, name: 'Evaluación dietética' },
  { id: 4, name: 'Estilo de vida' },
  { id: 5, name: 'Recordatorio 24h' },
];

export default function FormStepper({ currentStep }: FormStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {steps.map((step) => (
          <li key={step.name} className="relative">
            <div className="flex items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id}
              </span>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= step.id ? 'text-green-800' : 'text-gray-400'
                } hidden md:block`}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

