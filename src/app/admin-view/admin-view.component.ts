import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { DatosGenerales } from './models/datosGenerales';
import { Antiguedad } from './models/antiguedad';
import { preaparacionAcademica } from './models/preaparacionAcademica';
import { Curso } from './models/cursos';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css'],
})
export class AdminViewComponent implements OnInit {
  //Variables
  puntajeAnios: number[] = new Array(28).fill(0);
  totalAntiguedad: number = 0;
  Cursos = [
    {
      _id: '0',
      id: 1,
      nombre: 'Curso_1',
      puntaje: 10,
    },
    {
      _id: '1',
      id: 2,
      nombre: 'Curso_2',
      puntaje: 11,
    },
    {
      _id: '2',
      id: 3,
      nombre: 'Curso_3',
      puntaje: 12,
    },
  ];
  modoEdicion: boolean = false;
  programasDesarrollo: number = 0;
  total: number = 0;
  posicionDelCurso: number = 0;
  habilitarBotonAgregarCurso: boolean = false;
  habilitarBotonEnviarInformacion: boolean = false;
  evaluar1: boolean = false;
  evaluar2: boolean = false;
  evaluar3: boolean = false;
  URL: string = 'https://experimental-kteg.vercel.app/api/';

  //Variables formato
  Formato_FCAPS_Seleccionado: File = new File([], '');
  Formato_CentralesDrs_Seleccionado: File = new File([], '');
  Formato_Educativa_Seleccionado: File = new File([], '');
  Formato_Horario_Seleccionado: File = new File([], '');
  Formato_Inscripciones_Seleccionado: File = new File([], '');
  Formato_SNTE_Seleccionado: File = new File([], '');
  Formato_Jefatura_Seleccionado: File = new File([], '');

  Formato_FCAPS_Nombre: string = '';
  Formato_CentralesDrs_Nombre: string = '';
  Formato_Educativa_Nombre: string = '';
  Formato_Horario_Nombre: string = '';
  Formato_Inscripciones_Nombre: string = '';
  Formato_SNTE_Nombre: string = '';
  Formato_Jefatura_Nombre: string = '';

  //Información que se recibe del backend
  datosgenerales: DatosGenerales;
  antiguedad: Antiguedad;
  preparacionacademica: preaparacionAcademica;
  curso: Curso;

  //Preparación académica
  puntajeTotalMaximo: number = 0;

  calcularPuntajeTotalMaximo() {
    this.puntajeTotalMaximo =
      this.preparacionacademica.primaria[5] + this.preparacionacademica.secundaria[2] + this.preparacionacademica.carreraC[2] + this.preparacionacademica.licenciatura[3];
  }

  //Cursos
  constructor() {
    this.datosgenerales = {
      _id: '0',
      anio: '0000',
      etapa: 'Octava Etapa',
      etapaConLetra: 'XIII',
      fechaLimite: 'Lunes 28 del 2050',
      municipio: 'Irapuato',
      periodoEvaluado: 'Periodo 8vo',
    };
    this.antiguedad = {
      _id: '0',
      valoresAntiguedad: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28,
      ],
    };
    this.preparacionacademica = {
      _id: '0',
      primaria: [1, 2, 3, 4, 5, 6],
      secundaria: [1, 2, 3],
      carreraC: [1, 2, 3],
      licenciatura: [1, 2, 3, 4],
    };
    this.Cursos.length >= 1
      ? (this.curso = {
          _id: '',
          id: this.Cursos[this.Cursos.length - 1].id + 1,
          nombre: '',
          puntaje: 0,
        })
      : (this.curso = {
          _id: '',
          id: 0,
          nombre: '',
          puntaje: 0,
        });
  }

  ngOnInit() {
    // Recibir información del backend datosGenerales
    fetch(this.URL + 'datosGenerales')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.datosgenerales = post[0];
        console.log(this.datosgenerales);
      });

    fetch(this.URL + 'antiguedad')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.antiguedad = post[0];
        console.log(this.antiguedad);
      });

    fetch(this.URL + 'preparacionAcademica')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.preparacionacademica = post[0];
        console.log(this.preparacionacademica);
      });

    fetch(this.URL + 'cursos')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.Cursos = post;
        console.log(this.Cursos);
      });

    setTimeout(() => {
      this.rellenarFormularioAntiguedad();
    }, 300);

    // Variables que se repiten constantemente
    setInterval(() => {
      this.calcularPuntajeTotalMaximo();
      this.evaluandoCurso();
      this.evaluarFormulario();
      // this.totalAntiguedad = this.puntajeAnios.reduce((a, b) => a + b, 0);
      this.totalAntiguedad = this.puntajeAnios[27];
      this.programasDesarrollo = this.Cursos.reduce((a, b) => a + b.puntaje, 0);

      this.total =
        this.totalAntiguedad +
        this.puntajeTotalMaximo +
        this.programasDesarrollo +
        60;

      let puntajeCurso = document.getElementById('puntaje') as HTMLInputElement;

      if (puntajeCurso.value == '0') {
        puntajeCurso.value = '';
      }
    }, 200);
  }

  // Cursos
  addCursos() {
    this.Cursos.length >= 1
      ? (this.curso.id = this.Cursos[this.Cursos.length - 1].id + 1)
      : (this.curso.id = 0);

    fetch(this.URL + 'cursos', {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(this.curso), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .catch((error) => console.error('Error:', error))
      .then((response) => console.log('Success:', response));

    this.Cursos.push(this.curso);

    this.curso = {
      _id: '',
      id: this.Cursos[this.Cursos.length - 1].id + 1,
      nombre: '',
      puntaje: 0,
    };

    this.programasDesarrollo = this.Cursos.reduce((a, b) => a + b.puntaje, 0);
  }

  editCursos(curso: Curso) {
    for (let i = 0; this.Cursos.length - 1 >= i; i++) {
      if (this.Cursos[i].id === curso.id) {
        this.posicionDelCurso = i;
        break;
      }
    }

    this.curso = this.Cursos[this.posicionDelCurso];

    this.modoEdicion = true;
  }

  evaluandoCurso() {
    const cursoNombre = document.getElementById(
      'nombreCurso'
    ) as HTMLInputElement;
    const cursoPuntaje = document.getElementById('puntaje') as HTMLInputElement;

    if (cursoNombre.value.length >= 1 && cursoPuntaje.value.length >= 1) {
      this.habilitarBotonAgregarCurso = true;
    } else {
      this.habilitarBotonAgregarCurso = false;
    }
  }

  confirmarEdicionCurso() {
    if (confirm('¿Está seguro que desea editar este curso?')) {
      fetch(this.URL + 'cursos/' + this.Cursos[this.posicionDelCurso]._id, {
        method: 'PUT', // or 'PUT'
        body: JSON.stringify(this.curso), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .catch((error) => console.error('Error:', error))
        .then((response) => console.log('Success:', response));

      this.Cursos.splice(this.posicionDelCurso, 1); // Eliminar el registro del arreglo
      this.Cursos.push(this.curso);
    }

    this.curso = {
      _id: '',
      id: this.Cursos[this.Cursos.length - 1].id + 1,
      nombre: '',
      puntaje: 0,
    };

    this.programasDesarrollo = this.Cursos.reduce((a, b) => a + b.puntaje, 0);
  }

  deleteCursos(id: number) {
    for (let i = 0; this.Cursos.length - 1 >= i; i++) {
      if (this.Cursos[i].id === id) {
        this.posicionDelCurso = i;
        break;
      }
    }

    if (confirm('¿Está seguro que desea eliminarlo?')) {
      fetch(this.URL + 'cursos/' + this.Cursos[this.posicionDelCurso]._id, {
        method: 'delete',
      }).then((response) =>
        response.json().then((json) => {
          return json;
        })
      );

      this.Cursos.splice(this.posicionDelCurso, 1); // Eliminar el registro del arreglo
    }

    this.programasDesarrollo = this.Cursos.reduce((a, b) => a + b.puntaje, 0);
  }

  salirDelModoEdicion() {
    this.modoEdicion = false;

    this.curso = {
      _id: '',
      id: this.Cursos[this.Cursos.length - 1].id + 1,
      nombre: '',
      puntaje: 0,
    };
  }

  // Form
  resetForm(form?: NgForm) {
    if (form) {
      form.resetForm();
    }
  }

  rellenarFormularioAntiguedad() {
    this.puntajeAnios = this.antiguedad.valoresAntiguedad;
  }

  enviarInformacion() {
    try {
      fetch(this.URL + 'datosGenerales/' + this.datosgenerales._id, {
        method: 'PUT', // or 'PUT'
        body: JSON.stringify(this.datosgenerales), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .catch((error) => console.error('Error:', error))
        .then((response) => console.log('Success:', response));
      fetch(this.URL + 'antiguedad/' + this.antiguedad._id, {
        method: 'PUT', // or 'PUT'
        body: JSON.stringify(this.antiguedad), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .catch((error) => console.error('Error:', error))
        .then((response) => console.log('Success:', response));
      fetch(
        this.URL + 'preparacionAcademica/' + this.preparacionacademica._id,
        {
          method: 'PUT', // or 'PUT'
          body: JSON.stringify(this.preparacionacademica), // data can be `string` or {object}!
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => res.json())
        .catch((error) => console.error('Error:', error))
        .then((response) => console.log('Success:', response));

      alert('Se ha modificado la información exitosamente');
    } catch (error) {
      console.log(error);
    }
  }

  evaluarFormulario() {
    // Datos Generales
    const anios = document.getElementById('anio') as HTMLInputElement;
    const periodo = document.getElementById('periodo') as HTMLInputElement;
    const municipio = document.getElementById('municipio') as HTMLInputElement;
    const etapa = document.getElementById('etapa') as HTMLInputElement;
    const etapaLetra = document.getElementById(
      'etapaLetra'
    ) as HTMLInputElement;
    const fechaLimite = document.getElementById(
      'fechaLimite'
    ) as HTMLInputElement;

    if (
      municipio.value.length >= 1
    ) {
      this.evaluar1 = true;
    } else {
      this.evaluar1 = false;
    }

    // Anios de antiguedad
    const puntajeAnios1 = document.getElementById(
      'puntajeAnios1'
    ) as HTMLInputElement;
    const puntajeAnios2 = document.getElementById(
      'puntajeAnios2'
    ) as HTMLInputElement;
    const puntajeAnios3 = document.getElementById(
      'puntajeAnios3'
    ) as HTMLInputElement;
    const puntajeAnios4 = document.getElementById(
      'puntajeAnios4'
    ) as HTMLInputElement;
    const puntajeAnios5 = document.getElementById(
      'puntajeAnios5'
    ) as HTMLInputElement;
    const puntajeAnios6 = document.getElementById(
      'puntajeAnios6'
    ) as HTMLInputElement;
    const puntajeAnios7 = document.getElementById(
      'puntajeAnios7'
    ) as HTMLInputElement;
    const puntajeAnios8 = document.getElementById(
      'puntajeAnios8'
    ) as HTMLInputElement;
    const puntajeAnios9 = document.getElementById(
      'puntajeAnios9'
    ) as HTMLInputElement;
    const puntajeAnios10 = document.getElementById(
      'puntajeAnios10'
    ) as HTMLInputElement;
    const puntajeAnios11 = document.getElementById(
      'puntajeAnios11'
    ) as HTMLInputElement;
    const puntajeAnios12 = document.getElementById(
      'puntajeAnios12'
    ) as HTMLInputElement;
    const puntajeAnios13 = document.getElementById(
      'puntajeAnios13'
    ) as HTMLInputElement;
    const puntajeAnios14 = document.getElementById(
      'puntajeAnios14'
    ) as HTMLInputElement;
    const puntajeAnios15 = document.getElementById(
      'puntajeAnios15'
    ) as HTMLInputElement;
    const puntajeAnios16 = document.getElementById(
      'puntajeAnios16'
    ) as HTMLInputElement;
    const puntajeAnios17 = document.getElementById(
      'puntajeAnios17'
    ) as HTMLInputElement;
    const puntajeAnios18 = document.getElementById(
      'puntajeAnios18'
    ) as HTMLInputElement;
    const puntajeAnios19 = document.getElementById(
      'puntajeAnios19'
    ) as HTMLInputElement;
    const puntajeAnios20 = document.getElementById(
      'puntajeAnios20'
    ) as HTMLInputElement;
    const puntajeAnios21 = document.getElementById(
      'puntajeAnios21'
    ) as HTMLInputElement;
    const puntajeAnios22 = document.getElementById(
      'puntajeAnios22'
    ) as HTMLInputElement;
    const puntajeAnios23 = document.getElementById(
      'puntajeAnios23'
    ) as HTMLInputElement;
    const puntajeAnios24 = document.getElementById(
      'puntajeAnios24'
    ) as HTMLInputElement;
    const puntajeAnios25 = document.getElementById(
      'puntajeAnios25'
    ) as HTMLInputElement;
    const puntajeAnios26 = document.getElementById(
      'puntajeAnios26'
    ) as HTMLInputElement;
    const puntajeAnios27 = document.getElementById(
      'puntajeAnios27'
    ) as HTMLInputElement;
    const puntajeAnios28 = document.getElementById(
      'puntajeAnios28'
    ) as HTMLInputElement;

    if (
      puntajeAnios1.value.length >= 1 &&
      puntajeAnios2.value.length >= 1 &&
      puntajeAnios3.value.length >= 1 &&
      puntajeAnios4.value.length >= 1 &&
      puntajeAnios5.value.length >= 1 &&
      puntajeAnios6.value.length >= 1 &&
      puntajeAnios7.value.length >= 1 &&
      puntajeAnios8.value.length >= 1 &&
      puntajeAnios9.value.length >= 1 &&
      puntajeAnios10.value.length >= 1 &&
      puntajeAnios11.value.length >= 1 &&
      puntajeAnios12.value.length >= 1 &&
      puntajeAnios13.value.length >= 1 &&
      puntajeAnios14.value.length >= 1 &&
      puntajeAnios15.value.length >= 1 &&
      puntajeAnios16.value.length >= 1 &&
      puntajeAnios17.value.length >= 1 &&
      puntajeAnios18.value.length >= 1 &&
      puntajeAnios19.value.length >= 1 &&
      puntajeAnios20.value.length >= 1 &&
      puntajeAnios21.value.length >= 1 &&
      puntajeAnios22.value.length >= 1 &&
      puntajeAnios23.value.length >= 1 &&
      puntajeAnios24.value.length >= 1 &&
      puntajeAnios25.value.length >= 1 &&
      puntajeAnios27.value.length >= 1 &&
      puntajeAnios28.value.length >= 1
    ) {
      this.evaluar2 = true;
    } else {
      this.evaluar2 = false;
    }

    // preparacion Academica
    const prim1 = document.getElementById('prim1') as HTMLInputElement;
    const prim2 = document.getElementById('prim2') as HTMLInputElement;
    const prim3 = document.getElementById('prim3') as HTMLInputElement;
    const prim4 = document.getElementById('prim4') as HTMLInputElement;
    const prim5 = document.getElementById('prim5') as HTMLInputElement;
    const prim6 = document.getElementById('prim6') as HTMLInputElement;

    const sec1 = document.getElementById('sec1') as HTMLInputElement;
    const sec2 = document.getElementById('sec2') as HTMLInputElement;
    const sec3 = document.getElementById('sec3') as HTMLInputElement;

    const bach1 = document.getElementById('bach1') as HTMLInputElement;
    const bach2 = document.getElementById('bach2') as HTMLInputElement;
    const bach3 = document.getElementById('bach3') as HTMLInputElement;

    const lic1 = document.getElementById('lic1') as HTMLInputElement;
    const lic2 = document.getElementById('lic2') as HTMLInputElement;
    const lic3 = document.getElementById('lic3') as HTMLInputElement;
    const lic4 = document.getElementById('lic4') as HTMLInputElement;

    if (
      prim1.value.length >= 1 &&
      prim2.value.length >= 1 &&
      prim3.value.length >= 1 &&
      prim4.value.length >= 1 &&
      prim5.value.length >= 1 &&
      prim6.value.length >= 1 &&
      sec1.value.length >= 1 &&
      sec2.value.length >= 1 &&
      sec3.value.length >= 1 &&
      bach1.value.length >= 1 &&
      bach2.value.length >= 1 &&
      bach3.value.length >= 1 &&
      lic1.value.length >= 1 &&
      lic2.value.length >= 1 &&
      lic3.value.length >= 1 &&
      lic4.value.length >= 1
    ) {
      this.evaluar3 = true;
    } else {
      this.evaluar3 = false;
    }

    if (
      this.evaluar1 == true &&
      this.evaluar2 == true &&
      this.evaluar3 == true
    ) {
      this.habilitarBotonEnviarInformacion = true;
    } else {
      this.habilitarBotonEnviarInformacion = false;
    }
  }

  cargarArchivo_Formato_FCAPS(evento: any) {
    this.Formato_FCAPS_Seleccionado = evento.target.files[0];
    this.Formato_FCAPS_Nombre = this.Formato_FCAPS_Seleccionado.name;
  }

  enviarArchivo_Formato_FCAPS(evento: any) {
    evento.preventDefault();

    if (this.Formato_FCAPS_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_FCAPS_Seleccionado);

      fetch(this.URL + 'files/Formato_FCAPS', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_CentralesDrs(evento: any) {
    this.Formato_CentralesDrs_Seleccionado = evento.target.files[0];
    this.Formato_CentralesDrs_Nombre =
      this.Formato_CentralesDrs_Seleccionado.name;
  }

  enviarArchivo_CentralesDrs(evento: any) {
    evento.preventDefault();

    if (this.Formato_CentralesDrs_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_CentralesDrs_Seleccionado);

      fetch(this.URL + 'files/CentralesDRs', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_Educativa(evento: any) {
    this.Formato_Educativa_Seleccionado = evento.target.files[0];
    this.Formato_Educativa_Nombre = this.Formato_Educativa_Seleccionado.name;
  }

  enviarArchivo_Educativa(evento: any) {
    evento.preventDefault();

    if (this.Formato_Educativa_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_Educativa_Seleccionado);

      fetch(this.URL + 'files/files/Educativas', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_Horario(evento: any) {
    this.Formato_Horario_Seleccionado = evento.target.files[0];
    this.Formato_Horario_Nombre = this.Formato_Horario_Seleccionado.name;
  }

  enviarArchivo_Horario(evento: any) {
    evento.preventDefault();

    if (this.Formato_Horario_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_Horario_Seleccionado);

      fetch(this.URL + 'files/Horario', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_Inscripciones(evento: any) {
    this.Formato_Inscripciones_Seleccionado = evento.target.files[0];
    this.Formato_Inscripciones_Nombre =
      this.Formato_Inscripciones_Seleccionado.name;
  }

  enviarArchivo_Inscripciones(evento: any) {
    evento.preventDefault();

    if (this.Formato_Inscripciones_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_Inscripciones_Seleccionado);

      fetch(this.URL + 'files/Inscripcion', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_SNTE(evento: any) {
    this.Formato_Educativa_Seleccionado = evento.target.files[0];
    this.Formato_Educativa_Nombre = this.Formato_Educativa_Seleccionado.name;
  }

  enviarArchivo_SNTE(evento: any) {
    evento.preventDefault();

    if (this.Formato_Educativa_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_Educativa_Seleccionado);

      fetch(this.URL + 'files/SNTE', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }

  cargarArchivo_Jefatura(evento: any) {
    this.Formato_Educativa_Seleccionado = evento.target.files[0];
    this.Formato_Educativa_Nombre = this.Formato_Educativa_Seleccionado.name;
  }

  enviarArchivo_Jefatura(evento: any) {
    evento.preventDefault();

    if (this.Formato_Educativa_Seleccionado) {
      const formData = new FormData();
      formData.append('file', this.Formato_Educativa_Seleccionado);

      fetch('http://localhost:4001/api/files/SNTE', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Archivo enviado exitosamente');
            // Realiza acciones adicionales si es necesario
          } else {
            console.error('Error al enviar el archivo:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error al enviar el archivo:', error);
        });

      alert('Archivo enviado');
    }
  }
}
