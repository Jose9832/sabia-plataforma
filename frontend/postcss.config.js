import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';
import tailwindcss from 'tailwindcss';

// El módulo de Salud SABIA trae su propia hoja de estilos (diseño del prototipo SABIA).
// Para que no choque con Tailwind ni con el diseño de ALUNA, todos sus selectores se
// encierran bajo `.sabia-modulo`: `:root` y `body` pasan a ser el contenedor del módulo.
const aislarModuloSalud = prefixSelector({
  prefix: '.sabia-modulo',
  includeFiles: [/modules[\/]salud[\/]styles/],
  transform(prefix, selector, prefixed) {
    if (selector === ':root' || selector === 'body' || selector === 'html') return prefix;
    if (selector.startsWith('body ')) return `${prefix} ${selector.slice(5)}`;
    return prefixed;
  }
});

export default {
  plugins: [aislarModuloSalud, tailwindcss, autoprefixer]
};
