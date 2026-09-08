import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Configurator from './components/Configurator';
import Diagnostics from './components/Diagnostics';
import Logs from './components/Logs';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <main>
        <Categories />
        <Products />
        <Configurator />
        <Diagnostics />
        <Logs />
      </main>
      <Footer />
    </>
  );
}
