import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="h-20 w-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
        <FileQuestion className="h-10 w-10 stroke-[1.5]" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl mb-2">
        Página no encontrada (404)
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm sm:text-base">
        La ruta a la que intentas acceder no existe en el sistema de ReservaUPLA o ha sido reubicada dentro de la intranet institucional.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/inicio">
          <Button variant="primary" icon={Home}>
            Ir al Inicio
          </Button>
        </Link>
        <Link to="/reservas">
          <Button variant="outline" icon={ArrowLeft}>
            Ver Reservas
          </Button>
        </Link>
      </div>
    </div>
  );
}
