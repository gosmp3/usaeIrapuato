import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { centros } from '../models/centros';
import { Formulario } from './Funciones/form-data.interface';
import { Personal, personal } from '../models/personal';
import {
  validaciones,
  validezFormulario,
  limpiarMensajesValidaciones,
  getValues,
  getValues_Acta_SNTE,
  getValues_Acta_INSTITUCION_EDUCATIVA,
  getValues_Acta_JEFATURA,
  getValues_Acta_DELEGACION_REGIONAL,
} from './Funciones/form-validación';
import { controlarFormulario } from './Funciones/form-controlarFormulario';
import { aniosDeAntiguedad } from './Funciones/funcionesTransformacion';
import { DatosGenerales } from '../admin-view/models/datosGenerales';
import { Antiguedad } from '../admin-view/models/antiguedad';
import { preaparacionAcademica } from '../admin-view/models/preaparacionAcademica';
import { Curso } from '../admin-view/models/cursos';

import { ToastrService } from 'ngx-toastr';
import { Renderer2 } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-form2',
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.css'],
})
export class Form2Component implements OnInit {
  @ViewChild('informacion') modalElement!: ElementRef;

  // Información del backend
  datosgenerales_Backend: DatosGenerales;
  antiguedad_Backend: Antiguedad;
  preparacionacademica_Backend: preaparacionAcademica;
  curso: Curso;
  Cursos = [
    {
      _id: '0',
      id: 1,
      nombre: 'Curso_1',
      puntaje: 10,
    },
  ];

  TotalPreparacionAcademica: number = 0;
  URL: string = 'https://experimental-kteg.vercel.app/api/';

  // Definición del formulario para agregar, editar y elminar información
  form: Formulario;

  // Variables que se utilizan para calcular información del documento
  sumaPuntaje: number = 0;
  currentYear!: number;
  desempeno!: number;
  desempenoRedondeado!: String;
  multiPuntajeyDias!: number;
  antiguedad!: number;
  academico!: number;
  periodo!: string;
  resultt!: string;
  sumaPreparacionA!: number;

  // Variables para manipular la información almacenada
  registros!: any[];
  centros = [...centros];
  aniosAntiguedad: Number = 0;
  opcionesImprimir: Boolean[] = [true, true, true, true, true];

  // Variables para manipular el HTML
  modal: boolean = false;
  BotonAgregar: boolean = true;
  activado: boolean = true;
  desactivar: boolean = true;
  nuevosRegistros: number = 0;
  modificarRegistro: boolean = false;
  activarBotonActa: boolean = false;
  generarActa: boolean = false;

  //Variables para datos Actas constitutivas
  calle: string = '';
  colonia: string = '';
  turno: string = '';
  hora: number = 0;
  hora2: number = 0;
  minutos: number = 0;
  minutos2: number = 0;
  numcalle: number = 0;
  zona: number = 0;
  director: string = '';
  representdocente: string = '';
  represetsindical: string = '';
  numpersonal: number = 0;
  observacionesacta: string = '';
  observacionesacta2: string = '';
  fechaInicioActa: string = '';
  fechaFinActa: string = '';
  cursosCompletados: boolean[] = [];

  // Funciones
  protected instanciaControlarFormulario: controlarFormulario;

  // Define el valor por default para visualizar la información
  registroParaLaVisualizacion = {
    id: 0,
    rfc: '',
    nombrepersonal: '',
    seccionsindical: '',
    funcion: '',
    clavecentro: '',
    centrotrabajo: '',
    tipoCentro: '',
    municipio: '',
    telefonocentro: '',
    evaluador: '',
    fechaFormateada: '',
    dias: 0,
    puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    resultadototal: 0,
    multiPuntajeyDias: 0,
    cursosCompletados: new Array(this.Cursos.length - 1).fill(false),
    desempeno: 0,
    antiguedad: '',
    academico: '',
    cursos: '',
    puntaje: '',
    observaciones: '',
    nuevo: true,
  };

  // Obtener la fecha actual del sistema
  fechaActual = new Date();
  // Obtener solo el dia, mes y año
  dia = this.fechaActual.getDate();
  mes = this.fechaActual.getMonth() + 1;
  anio = this.fechaActual.getFullYear();
  // Asignarlo a la variable fechaFormateada
  fechaFormateada = `${this.dia.toString().padStart(2, '0')}/${this.mes
    .toString()
    .padStart(2, '0')}/${this.anio}`;

  constructor(private toastr: ToastrService, private renderer: Renderer2) {
    this.instanciaControlarFormulario = new controlarFormulario(
      this.toastr,
      this.renderer
    );

    // Variables
    this.datosgenerales_Backend = {
      _id: '0',
      anio: '0000',
      etapa: 'Octava Etapa',
      etapaConLetra: 'XIII',
      fechaLimite: 'Lunes 28 del 2050',
      municipio: 'Irapuato',
      periodoEvaluado: 'Periodo 8vo',
    };
    this.antiguedad_Backend = {
      _id: '0',
      valoresAntiguedad: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28,
      ],
    };
    this.preparacionacademica_Backend = {
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

    // Obtiene el año actual del sistema
    this.currentYear = new Date().getFullYear();
    // Concatena los meses del periodo con el año actual -1
    this.periodo = 'Enero-Diciembre ' + (this.currentYear - 1);
    // Recupera los datos del LocalStorage al inicializar el componente
    const storedData = localStorage.getItem('registros');
    // Si hay datos almacenados, conviértelos de nuevo a un objeto o matriz JSON
    this.registros = storedData ? JSON.parse(storedData) : [];

    this.registros.length >= 1
      ? (this.form = {
          id: this.registros[this.registros.length - 1].id + 1,
          etapa: this.datosgenerales_Backend.etapa,
          resultadoTotal: 0,
          observaciones: '',
          nombrepersonal: '',
          seccionsindical: 0,
          tipoCentro: this.registros[0].tipoCentro,
          rfc: '',
          inicioperiodo: this.datosgenerales_Backend.anio,
          finperiodo: this.datosgenerales_Backend.fechaLimite,
          centrotrabajo: this.registros[0].centrotrabajo,
          evaluador: this.registros[0].evaluador,
          periodoevaluado: this.datosgenerales_Backend.periodoEvaluado,
          municipio: this.registros[0].municipio,
          funcion: '',
          clavecentro: this.registros[0].clavecentro,
          telefonocentro: this.registros[0].telefonocentro,
          dias: 365,
          cursos: 0,
          nuevo: true,
          notificacionNuevo: true,
          multiPuntajeyDias: 0,
          fechaFormateada: '',
          cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

          puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          // puntajeComp: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        })
      : (this.form = {
          id: 0,
          etapa: this.datosgenerales_Backend.etapa,
          resultadoTotal: 0,
          observaciones: '',
          nombrepersonal: '',
          seccionsindical: 0,
          tipoCentro: '',
          rfc: '',
          inicioperiodo: this.datosgenerales_Backend.anio,
          finperiodo: this.datosgenerales_Backend.fechaLimite,
          centrotrabajo: '',
          evaluador: '',
          periodoevaluado: this.datosgenerales_Backend.periodoEvaluado,
          municipio: this.datosgenerales_Backend.municipio,
          funcion: '',
          clavecentro: '',
          telefonocentro: '',
          dias: 365,
          cursos: 0,
          nuevo: true,
          notificacionNuevo: true,
          multiPuntajeyDias: 0,
          fechaFormateada: '',
          cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

          puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });
  }

  autocompletarNombre() {
    const rfc = this.form.rfc;

    // Buscar el personal en la lista a partir del RFC ingresado
    const personalEncontrado = personal.find((p: Personal) => p.RFC === rfc);

    if (personalEncontrado) {
      this.form.nombrepersonal = personalEncontrado.Nombre;
    } else {
      this.form.nombrepersonal = '';
    }
  }

  // Clave de centro codigo
  onClaveCentroChange() {
    const selectedClave = this.form.clavecentro;
    const selectedCentro = this.centros.find(
      (centro) => centro.clave_de_centro === selectedClave
    );
    if (selectedCentro) {
      this.form.centrotrabajo = selectedCentro.centro_de_trabajo;
    } else {
      this.form.centrotrabajo = '';
    }
  }

  // Obtener la cantidad de nuevos registros
  contarNuevosRegistros() {
    this.nuevosRegistros = 0;

    this.registros.every((elemento) => {
      if (elemento.nuevo === true) {
        this.nuevosRegistros++;
      }
      return elemento;
    });
  }

  // Marcar los mensajes nuevos como leidos
  marcarMensajeComoLeido() {
    for (let i = 0; i <= this.registros.length - 1; i++) {
      this.registros[i].nuevo = false;
    }

    localStorage.setItem('registros', JSON.stringify(this.registros));
  }

  EliminarEtiquetasNuevoRegistro() {
    for (let i = 0; i <= this.registros.length - 1; i++) {
      this.registros[i].notificacionNuevo = false;
    }

    localStorage.setItem('registros', JSON.stringify(this.registros));
  }

  activarLlenarActa() {
    this.generarActa = true;
  }

  desactivarLlenarActa() {
    this.generarActa = false;
  }

  ngOnInit() {
    this.modificarRegistro = false;
    this.desempenoRedondeado = '0';

    // Recibir información del backend datosGenerales
    fetch(this.URL + 'datosGenerales')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.datosgenerales_Backend = post[0];
        // console.log(this.datosgenerales_Backend);
      });

    fetch(this.URL + 'antiguedad')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.antiguedad_Backend = post[0];
        // console.log(this.antiguedad_Backend);
      });

    fetch(this.URL + 'preparacionAcademica')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.preparacionacademica_Backend = post[0];
        // console.log(this.preparacionacademica_Backend);

        this.TotalPreparacionAcademica =
          this.preparacionacademica_Backend.primaria[5] + this.preparacionacademica_Backend.secundaria[2] + this.preparacionacademica_Backend.carreraC[2] + this.preparacionacademica_Backend.licenciatura[3];
      });

    fetch(this.URL + 'cursos')
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        this.Cursos = post;
        // console.log(this.Cursos);
      });
      this.sumaPreparacionA = this.preparacionacademica_Backend.primaria[5] + this.preparacionacademica_Backend.secundaria[2] + this.preparacionacademica_Backend.carreraC[2] + this.preparacionacademica_Backend.licenciatura[3];

    this.cursosCompletados = new Array(this.Cursos.length - 1).fill(false);

    setInterval(() => {
      this.activado = this.instanciaControlarFormulario.BloqueoInteligente(
        this.registros,
        this.modificarRegistro
      );

      this.evaluar();
      this.calcularSumaPuntajes();
      this.sumarTodo();
      this.contarNuevosRegistros();
      this.calcularCursos();
      this.seccionesImprimir();

      if (this.registros.length >= 1) {
        if (this.registros[0].tipoCentro === 'SNTE') {
          this.activarBotonActa = getValues_Acta_SNTE();
        }

        if (this.registros[0].tipoCentro === 'INSTITUCION EDUCATIVA') {
          this.activarBotonActa = getValues_Acta_INSTITUCION_EDUCATIVA();
        }

        if (
          this.registros[0].tipoCentro === 'SUPERVISION Y JEFATURA DE SECTOR'
        ) {
          this.activarBotonActa = getValues_Acta_JEFATURA();
        }

        if (
          this.registros[0].tipoCentro ===
          'DELEGACION REGIONAL, OFICINA CENTRAL, USAE y CEDE'
        ) {
          this.activarBotonActa = getValues_Acta_DELEGACION_REGIONAL();
        }
      }

      this.EvaluarBotonActa();
    }, 100);
  }

  EvaluarBotonActa(): void {
    const botonActa = document.getElementById(
      'botonDocumento'
    ) as HTMLInputElement;

    if (this.activarBotonActa) {
      botonActa.disabled = false;
    } else {
      botonActa.disabled = true;
    }
  }

  evaluar(): void {
    getValues();
    this.BotonAgregar = validezFormulario.every((val) => val);
  }

  comprobar(): void {
    validaciones();
    const validez = validezFormulario.every((val) => val);
    const valueWrong: number[] = [];

    // El siguiente for identifica los inputs que generan errores y los agrega a un array.
    for (let i = 0; i < validezFormulario.length; i++) {
      if (validezFormulario[i] === false) {
        valueWrong.push(i);
      }
    }

    // El siguiente for se reliza el envio de todos los mensajes de error generados.
    for (let i = valueWrong.length; i >= 0; i--) {
      switch (valueWrong[i]) {
        case 0:
          this.toastr.error(
            'El campo RFC con homoclave de la convocatoria no ha sido llenado',
            'RFC con homoclave',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 1:
          this.toastr.error(
            'El campo nombre del personal no ha sido llenado',
            'Nombre del personal',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 2:
          this.toastr.error(
            'El campo sección sindical no ha sido llenado',
            'Sección sindical',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 3:
          this.toastr.error('El campo función no ha sido llenado', 'Función', {
            timeOut: 5000,
            positionClass: 'toast-top-right',
            progressBar: true,
          });
          break;
        case 4:
          this.toastr.error(
            'El campo clave de centro de trabajo no ha sido llenado',
            'Clave de centro de trabajo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 5:
          this.toastr.error(
            'El campo tipo de centro de trabajo no ha sido llenado',
            'Tipo de centro de trabajo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 6:
          this.toastr.error(
            'El campo teléfono de su centro de trabajo no ha sido llenado',
            'Teléfono de su centro de trabajo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 7:
          this.toastr.error(
            'El campo nombre del evaluador no ha sido llenado',
            'Nombre del evaluador',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 8:
          this.toastr.error(
            'El campo días laborados no ha sido llenado',
            'Días laborados',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 9:
          this.toastr.error(
            'El campo de la tabla con la competencia logros de resultados no ha sido llenado',
            'Logros de resultados',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 10:
          this.toastr.error(
            'El campo de la tabla con la competencia iniciativa no ha sido llenado',
            'Iniciativa',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 11:
          this.toastr.error(
            'El campo de la tabla con la competencia relaciones interpersonales no ha sido llenado',
            'Relaciones Interpersonales',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 12:
          this.toastr.error(
            'El campo de la tabla con la competencia actitud de servicio no ha sido llenado',
            'Actitud de Servicio',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 13:
          this.toastr.error(
            'El campo de la tabla con la competencia trabajo en equipo no ha sido llenado',
            'Trabajo en equipo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 14:
          this.toastr.error(
            'El campo de la tabla con la competencia disponibilidad no ha sido llenado',
            'Disponibilidad',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 15:
          this.toastr.error(
            'El campo de la tabla con la competencia uso de recursos no ha sido llenado',
            'Uso de recursos',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 16:
          this.toastr.error(
            'El campo de la tabla con la competencia administración del tiempo no ha sido llenado',
            'Administración del tiempo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 17:
          this.toastr.error(
            'El campo de la tabla con la competencia conocimiento del trabajo no ha sido llenado',
            'Conocimiento del trabajo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 18:
          this.toastr.error(
            'El campo de la tabla con la competencia comunicación no ha sido llenado',
            'Comunicación',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 19:
          this.toastr.error(
            'El campo años de antigüedad no ha sido llenado',
            'Años de antigüedad',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 20:
          this.toastr.error(
            'El campo grado educativo no ha sido llenado',
            'Grado educativo',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
            }
          );
          break;
        case 21:
          this.toastr.error('El campo fecha no ha sido llenado', 'Fecha', {
            timeOut: 5000,
            positionClass: 'toast-top-right',
            progressBar: true,
          });
          break;
        default:
          break;
      }
    }

    // El siguiente switch dirige al usuario a la ubicación.
    switch (valueWrong[0]) {
      case 0:
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const rfcFocus = document.getElementById('rfc');
        const rfcFocusElement = rfcFocus as HTMLInputElement;

        rfcFocusElement.focus();

        break;
      case 1:
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const nombrePFocus = document.getElementById('nombrePersonal');
        const nombrePFocusElement = nombrePFocus as HTMLInputElement;

        nombrePFocusElement.focus();
        break;
      case 2:
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const secSindical = document.getElementById('seccionSindical');
        const secSindicalElement = secSindical as HTMLInputElement;

        secSindicalElement.focus();
        break;
      case 3:
        window.scrollTo({ top: 100, behavior: 'smooth' });

        const funcFocus = document.getElementById('funcion');
        const funcFocusElement = funcFocus as HTMLInputElement;

        funcFocusElement.focus();

        break;
      case 4:
        window.scrollTo({ top: 100, behavior: 'smooth' });

        const claveCentFocus = document.getElementById('clavecentro');
        const claveCentFocusElement = claveCentFocus as HTMLInputElement;

        claveCentFocusElement.focus();

        break;
      case 5:
        window.scrollTo({ top: 100, behavior: 'smooth' });

        const tipoCentFocus = document.getElementById('tipoCentro');
        const tipoCentFocusElement = tipoCentFocus as HTMLInputElement;

        tipoCentFocusElement.focus();

        break;
      case 6:
        window.scrollTo({ top: 250, behavior: 'smooth' });

        const telFocus = document.getElementById('telefono');
        const telFocusElement = telFocus as HTMLInputElement;

        telFocusElement.focus();

        break;
      case 7:
        window.scrollTo({ top: 350, behavior: 'smooth' });

        const nomEvalFocus = document.getElementById('nombreEvaluador');
        const nomEvalFocusElement = nomEvalFocus as HTMLInputElement;

        nomEvalFocusElement.focus();

        break;
      case 8:
        window.scrollTo({ top: 750, behavior: 'smooth' });

        const diasFocus = document.getElementById('dias');
        const diasFocusElement = diasFocus as HTMLInputElement;

        diasFocusElement.focus();

        break;
      case 9:
        window.scrollTo({ top: 1150, behavior: 'smooth' });

        const punt1Focus = document.getElementById('puntajeComp1');
        const punt1FocusElement = punt1Focus as HTMLInputElement;

        punt1FocusElement.focus();

        break;
      case 10:
        window.scrollTo({ top: 1150, behavior: 'smooth' });

        const punt2Focus = document.getElementById('puntajeComp2');
        const punt2FocusElement = punt2Focus as HTMLInputElement;

        punt2FocusElement.focus();

        break;
      case 11:
        window.scrollTo({ top: 1150, behavior: 'smooth' });

        const punt3Focus = document.getElementById('puntajeComp3');
        const punt3FocusElement = punt3Focus as HTMLInputElement;

        punt3FocusElement.focus();

        break;
      case 12:
        window.scrollTo({ top: 1150, behavior: 'smooth' });

        const punt4Focus = document.getElementById('puntajeComp4');
        const punt4FocusElement = punt4Focus as HTMLInputElement;

        punt4FocusElement.focus();

        break;
      case 13:
        window.scrollTo({ top: 1250, behavior: 'smooth' });

        const punt5Focus = document.getElementById('puntajeComp5');
        const punt5FocusElement = punt5Focus as HTMLInputElement;

        punt5FocusElement.focus();

        break;
      case 14:
        window.scrollTo({ top: 1250, behavior: 'smooth' });

        const punt6Focus = document.getElementById('puntajeComp6');
        const punt6FocusElement = punt6Focus as HTMLInputElement;

        punt6FocusElement.focus();

        break;
      case 15:
        window.scrollTo({ top: 1450, behavior: 'smooth' });

        const punt7Focus = document.getElementById('puntajeComp7');
        const punt7FocusElement = punt7Focus as HTMLInputElement;

        punt7FocusElement.focus();

        break;
      case 16:
        window.scrollTo({ top: 1450, behavior: 'smooth' });

        const punt8Focus = document.getElementById('puntajeComp8');
        const punt8FocusElement = punt8Focus as HTMLInputElement;

        punt8FocusElement.focus();

        break;
      case 17:
        window.scrollTo({ top: 1550, behavior: 'smooth' });

        const punt9Focus = document.getElementById('puntajeComp9');
        const punt9FocusElement = punt9Focus as HTMLInputElement;

        punt9FocusElement.focus();

        break;
      case 18:
        window.scrollTo({ top: 1550, behavior: 'smooth' });

        const punt10Focus = document.getElementById('puntajeComp10');
        const punt10FocusElement = punt10Focus as HTMLInputElement;

        punt10FocusElement.focus();

        break;
      case 19:
        window.scrollTo({ top: 2250, behavior: 'smooth' });

        const antiguedadFocus = document.getElementById('antiguedad');
        const antiguedadFocusElement = antiguedadFocus as HTMLInputElement;

        antiguedadFocusElement.focus();

        break;
      case 20:
        window.scrollTo({ top: 2350, behavior: 'smooth' });

        const academicoFocus = document.getElementById('academico');
        const academicoFocusElement = academicoFocus as HTMLInputElement;

        academicoFocusElement.focus();

        break;
      case 21:
        window.scrollTo({ top: 350, behavior: 'smooth' });

        const fecha = document.getElementById('fecha');
        const fechaElement = fecha as HTMLInputElement;

        fechaElement.focus();

        break;
      default:
        break;
    }
    this.calcularSumaPuntajes();
    this.sumarTodo();

    if (validez) {
      this.enviarDatos();
    }
  }

  enviarDatos(): void {
    // Obtén los valores de los campos
    var nuevoRegistro = {
      id: 0,
      nombrepersonal: this.form.nombrepersonal,
      centrotrabajo: this.form.centrotrabajo,
      tipoCentro: this.form.tipoCentro,
      clavecentro: this.form.clavecentro,
      seccionsindical: this.form.seccionsindical,
      evaluador: this.form.evaluador,
      rfc: this.form.rfc,
      municipio: this.form.municipio,
      funcion: this.form.funcion,

      telefonocentro: this.form.telefonocentro,
      fechaFormateada: this.fechaFormateada,
      puntajeComp: [
        this.form.puntajeComp[0],
        this.form.puntajeComp[1],
        this.form.puntajeComp[2],
        this.form.puntajeComp[3],
        this.form.puntajeComp[4],
        this.form.puntajeComp[5],
        this.form.puntajeComp[6],
        this.form.puntajeComp[7],
        this.form.puntajeComp[8],
        this.form.puntajeComp[9],
      ],

      cursosCompletados: this.cursosCompletados,
      sumaPuntaje: this.sumaPuntaje,
      dias: this.form.dias,
      desempeno: this.desempeno,
      multiPuntajeyDias: this.multiPuntajeyDias,
      antiguedad: this.antiguedad,
      academico: this.academico,
      cursos: this.form.cursos,
      resultadototal: this.resultt,
      observaciones: this.form.observaciones,
      nuevo: true,
      notificacionNuevo: true,
    };

    if (this.registros.length >= 1) {
      nuevoRegistro = {
        id: this.registros[this.registros.length - 1].id + 1,
        nombrepersonal: this.form.nombrepersonal,
        centrotrabajo: this.form.centrotrabajo,
        tipoCentro: this.form.tipoCentro,
        clavecentro: this.form.clavecentro,
        seccionsindical: this.form.seccionsindical,
        evaluador: this.form.evaluador,
        rfc: this.form.rfc,
        municipio: this.form.municipio,
        funcion: this.form.funcion,

        telefonocentro: this.form.telefonocentro,
        fechaFormateada: this.fechaFormateada,
        puntajeComp: [
          this.form.puntajeComp[0],
          this.form.puntajeComp[1],
          this.form.puntajeComp[2],
          this.form.puntajeComp[3],
          this.form.puntajeComp[4],
          this.form.puntajeComp[5],
          this.form.puntajeComp[6],
          this.form.puntajeComp[7],
          this.form.puntajeComp[8],
          this.form.puntajeComp[9],
        ],

        sumaPuntaje: this.sumaPuntaje,
        dias: this.form.dias,
        desempeno: this.desempeno,
        multiPuntajeyDias: this.multiPuntajeyDias,
        antiguedad: this.antiguedad,
        academico: this.academico,
        cursos: this.form.cursos,
        resultadototal: this.resultt,
        observaciones: this.form.observaciones,
        cursosCompletados: this.cursosCompletados,
        nuevo: true,
        notificacionNuevo: true,
      };
    }
    if (this.registros.length <= 37) {
      console.log(nuevoRegistro);
      // Agrega el nuevo dato a la variable datos
      this.registros.push(nuevoRegistro);
      // Guarda los datos actualizados en el LocalStorage
      localStorage.setItem('registros', JSON.stringify(this.registros));

      // Envia al usuario al inicio del formulario
      setTimeout(() => {
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }, 300);

      // Notificación de llenado exitoso
      this.toastr.success(
        'El registro ha sido añadido correctamente.',
        'Registro exitoso',
        {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          progressBar: true,
        }
      );

      // Limpiar formulario
      this.form = {
        id: this.registros[this.registros.length - 1].id + 1,
        etapa: '',
        resultadoTotal: 0,
        observaciones: '',
        nombrepersonal: '',
        seccionsindical: 0,
        tipoCentro: this.registros[0].tipoCentro,
        rfc: '',
        inicioperiodo: '',
        finperiodo: '',
        centrotrabajo: this.registros[0].centrotrabajo,
        evaluador: this.registros[0].evaluador,
        periodoevaluado: '',
        municipio: this.registros[0].municipio,
        funcion: '',
        clavecentro: this.registros[0].clavecentro,
        telefonocentro: this.registros[0].telefonocentro,
        dias: 365,
        cursos: 0,
        nuevo: true,
        notificacionNuevo: true,
        multiPuntajeyDias: 0,
        fechaFormateada: this.fechaFormateada,
        cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

        puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // puntajeComp: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      };
      this.cursosCompletados = new Array(this.Cursos.length - 1).fill(false);

      limpiarMensajesValidaciones();
    } else {
      console.log('NO SE AGREGO EL DATO');
      this.toastr.error(
        'Solo puedes realizar 38',
        'No puedes agregar mas registros',
        {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          progressBar: true,
        }
      );
    }
  }

  eliminarRegistro(registro: any): void {
    const index = this.registros.indexOf(registro); // Obtener el índice del registro a eliminar
    if (index !== -1) {
      this.registros.splice(index, 1); // Eliminar el registro del arreglo

      const data = JSON.stringify(this.registros); // Convertir el arreglo actualizado a una cadena JSON
      localStorage.setItem('registros', data); // Guardar los datos actualizados en el localStorage
    }

    if (this.registros.length === 0) {
      // Limpia el formulario
      this.form = {
        id: 1, // Asignar un valor predeterminado para la propiedad id
        etapa: '',
        resultadoTotal: 0,
        observaciones: '',
        nombrepersonal: '',
        seccionsindical: 0,
        tipoCentro: '',
        rfc: '',
        inicioperiodo: '',
        finperiodo: '',
        centrotrabajo: '',
        evaluador: '',
        periodoevaluado: '',
        municipio: '',
        funcion: '',
        clavecentro: '',
        telefonocentro: '',
        dias: 365,
        cursos: 0,
        multiPuntajeyDias: 0,
        fechaFormateada: this.fechaFormateada,
        cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

        puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        nuevo: true,
        notificacionNuevo: true,
      };
      this.cursosCompletados = new Array(this.Cursos.length - 1).fill(false);
      this.academico = 0;
      this.antiguedad = 0;
    }
    this.activado = this.instanciaControlarFormulario.BloqueoInteligente(
      this.registros,
      this.modificarRegistro
    );
  }

  eliminarTodosLosRegistros(): void {
    // Se vacia el array
    this.registros = [];

    // Limpia el formulario
    this.form = {
      id: 0,
      etapa: this.datosgenerales_Backend.etapa,
      resultadoTotal: 0,
      observaciones: '',
      nombrepersonal: '',
      seccionsindical: 0,
      tipoCentro: '',
      rfc: '',
      inicioperiodo: this.datosgenerales_Backend.anio,
      finperiodo: this.datosgenerales_Backend.fechaLimite,
      centrotrabajo: '',
      evaluador: '',
      periodoevaluado: this.datosgenerales_Backend.periodoEvaluado,
      municipio: this.datosgenerales_Backend.municipio,
      funcion: '',
      clavecentro: '',
      telefonocentro: '',
      dias: 365,
      cursos: 0,
      multiPuntajeyDias: 0,
      fechaFormateada: this.fechaFormateada,
      cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

      puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      nuevo: true,
      notificacionNuevo: true,
    };
    this.cursosCompletados = new Array(this.Cursos.length - 1).fill(false);
    this.academico = 0;
    this.antiguedad = 0;

    // Envia al usuario al inicio del formulario
    setTimeout(() => {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 300);

    // Notificación de llenado exitoso
    this.toastr.success(
      'Se han eliminado todos los registros.',
      'Los registros han sido eliminados',
      {
        timeOut: 5000,
        positionClass: 'toast-top-right',
        progressBar: true,
      }
    );

    // Se eliminan todos los demás registros
    localStorage.setItem('registros', JSON.stringify(this.registros));
  }

  visualizarRegistro(registro: any): void {
    const propiedadBuscada = 'id';
    const valorBuscado = registro.id;

    const objetoEncontrado = this.registros.find(
      (objeto) => objeto[propiedadBuscada] === valorBuscado
    );

    this.registroParaLaVisualizacion = objetoEncontrado;

    this.aniosAntiguedad = aniosDeAntiguedad(
      Number(this.registroParaLaVisualizacion.antiguedad),
      this.antiguedad_Backend
    );
  }

  // Reactiva el formulario, lo posiciona y lo rellena con la información seleccionada
  seleccionarParaEditarRegistro(): void {
    this.instanciaControlarFormulario.posicionarEditarFormulario();

    let valPuntajeComp = Object.values({
      ...this.registroParaLaVisualizacion.puntajeComp,
    });

    const [
      puntaje_1,
      puntaje_2,
      puntaje_3,
      puntaje_4,
      puntaje_5,
      puntaje_6,
      puntaje_7,
      puntaje_8,
      puntaje_9,
      puntaje_10,
    ] = valPuntajeComp;

    this.cursosCompletados = Object.values({
      ...this.registroParaLaVisualizacion.cursosCompletados,
    });

    this.form = {
      id: this.registroParaLaVisualizacion.id,
      etapa: this.datosgenerales_Backend.etapa,
      resultadoTotal: 0,
      observaciones: this.registroParaLaVisualizacion.observaciones,
      nombrepersonal: this.registroParaLaVisualizacion.nombrepersonal,
      seccionsindical: Number(this.registroParaLaVisualizacion.seccionsindical),
      tipoCentro: this.registroParaLaVisualizacion.tipoCentro,
      rfc: this.registroParaLaVisualizacion.rfc,
      inicioperiodo: this.datosgenerales_Backend.anio,
      finperiodo: this.datosgenerales_Backend.fechaLimite,
      centrotrabajo: this.registroParaLaVisualizacion.centrotrabajo,
      evaluador: this.registroParaLaVisualizacion.evaluador,
      periodoevaluado: this.datosgenerales_Backend.periodoEvaluado,
      municipio: this.registroParaLaVisualizacion.municipio,
      funcion: this.registroParaLaVisualizacion.funcion,
      clavecentro: this.registroParaLaVisualizacion.clavecentro,
      telefonocentro: this.registroParaLaVisualizacion.telefonocentro,
      dias: Number(this.registroParaLaVisualizacion.dias),
      cursos: Number(this.registroParaLaVisualizacion.cursos),
      multiPuntajeyDias: 0,
      fechaFormateada: this.registroParaLaVisualizacion.fechaFormateada,
      cursosCompletados: this.cursosCompletados,

      puntajeComp: [
        Number(puntaje_1),
        Number(puntaje_2),
        Number(puntaje_3),
        Number(puntaje_4),
        Number(puntaje_5),
        Number(puntaje_6),
        Number(puntaje_7),
        Number(puntaje_8),
        Number(puntaje_9),
        Number(puntaje_10),
      ],
      nuevo: true,
      notificacionNuevo: true,
    };
    this.academico = Number(this.registroParaLaVisualizacion.academico);
    this.antiguedad = Number(this.registroParaLaVisualizacion.antiguedad);
    this.fechaFormateada = this.registroParaLaVisualizacion.fechaFormateada;

    // Activar botón de editado
    this.modificarRegistro = true;
  }

  editarRegistro() {

    let val1 = Object.values({ ...this.cursosCompletados });
    let val2 = Object.values({ ...this.cursosCompletados });

    // Agregamos el nuevo registro
    // Obtén los valores de los campos
    let nuevoRegistro = {
      id: 0,
      nombrepersonal: this.form.nombrepersonal,
      centrotrabajo: this.form.centrotrabajo,
      tipoCentro: this.form.tipoCentro,
      clavecentro: this.form.clavecentro,
      seccionsindical: this.form.seccionsindical,
      evaluador: this.form.evaluador,
      rfc: this.form.rfc,
      municipio: this.form.municipio,
      funcion: this.form.funcion,

      telefonocentro: this.form.telefonocentro,
      fechaFormateada: this.fechaFormateada,
      puntajeComp: [
        this.form.puntajeComp[0],
        this.form.puntajeComp[1],
        this.form.puntajeComp[2],
        this.form.puntajeComp[3],
        this.form.puntajeComp[4],
        this.form.puntajeComp[5],
        this.form.puntajeComp[6],
        this.form.puntajeComp[7],
        this.form.puntajeComp[8],
        this.form.puntajeComp[9],
      ],

      sumaPuntaje: this.sumaPuntaje,
      dias: this.form.dias,
      desempeno: this.desempeno,
      multiPuntajeyDias: this.multiPuntajeyDias,
      antiguedad: this.antiguedad,
      academico: this.academico,
      cursos: this.form.cursos,
      resultadototal: this.resultt,
      observaciones: this.form.observaciones,
      cursosCompletados: val1,

      nuevo: true,
      notificacionNuevo: true,
    };

    if (this.registros.length > 0) {
      nuevoRegistro = {
        id: this.registros[this.registros.length - 1].id + 1,
        nombrepersonal: this.form.nombrepersonal,
        centrotrabajo: this.form.centrotrabajo,
        tipoCentro: this.form.tipoCentro,
        clavecentro: this.form.clavecentro,
        seccionsindical: this.form.seccionsindical,
        evaluador: this.form.evaluador,
        rfc: this.form.rfc,
        municipio: this.form.municipio,
        funcion: this.form.funcion,

        telefonocentro: this.form.telefonocentro,
        fechaFormateada: this.fechaFormateada,
        puntajeComp: [
          this.form.puntajeComp[0],
          this.form.puntajeComp[1],
          this.form.puntajeComp[2],
          this.form.puntajeComp[3],
          this.form.puntajeComp[4],
          this.form.puntajeComp[5],
          this.form.puntajeComp[6],
          this.form.puntajeComp[7],
          this.form.puntajeComp[8],
          this.form.puntajeComp[9],
        ],

        sumaPuntaje: this.sumaPuntaje,
        dias: this.form.dias,
        desempeno: this.desempeno,
        multiPuntajeyDias: this.multiPuntajeyDias,
        antiguedad: this.antiguedad,
        academico: this.academico,
        cursos: this.form.cursos,
        resultadototal: this.resultt,
        observaciones: this.form.observaciones,
        cursosCompletados: val2,

        nuevo: true,
        notificacionNuevo: true,
      };
    }

    // Agrega el nuevo dato a la variable datos
    this.registros.push(nuevoRegistro);

    // Guarda los datos actualizados en el LocalStorage
    localStorage.setItem('registros', JSON.stringify(this.registros));

    // Eliminamos el registro seleccionado
    this.eliminarRegistro(this.registroParaLaVisualizacion);

    // Ocultar botón para quitar el modo edición
    this.cerrarModoEdicion();
    limpiarMensajesValidaciones();

    // Envia al usuario al inicio del formulario
    setTimeout(() => {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 300);

    // Notificación de llenado exitoso
    this.toastr.info(
      'El registro ha sido editado correctamente.',
      'Registro editado exitosamente',
      {
        timeOut: 5000,
        positionClass: 'toast-top-right',
        progressBar: true,
      }
    );
  }

  cerrarModoEdicion() {
    this.toastr.info(
      'Ahora se pueden ingresar nuevos registros',
      'Se ha salido del modo edición',
      {
        timeOut: 5000,
        positionClass: 'toast-top-right',
        progressBar: true,
      }
    );

    setTimeout(() => {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 100);

    this.modificarRegistro = false;

    // Limpia el formulario
    this.form = {
      id: this.registros[this.registros.length - 1].id + 1,
      etapa: '',
      resultadoTotal: 0,
      observaciones: '',
      nombrepersonal: '',
      seccionsindical: 0,
      tipoCentro: this.registros[0].tipoCentro,
      rfc: '',
      inicioperiodo: '',
      finperiodo: '',
      centrotrabajo: this.registros[0].centrotrabajo,
      evaluador: this.registros[0].evaluador,
      periodoevaluado: '',
      municipio: this.registros[0].municipio,
      funcion: '',
      clavecentro: this.registros[0].clavecentro,
      telefonocentro: this.registros[0].telefonocentro,
      dias: 365,
      cursos: 0,
      multiPuntajeyDias: 0,
      fechaFormateada: this.fechaFormateada,
      cursosCompletados: new Array(this.Cursos.length - 1).fill(false),

      puntajeComp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // puntajeComp: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      nuevo: true,
      notificacionNuevo: true,
    };
    this.cursosCompletados = new Array(this.Cursos.length - 1).fill(false);
    this.fechaFormateada = '';
    this.academico = 0;
    this.antiguedad = 0;

    console.log('Modo Edición');
    console.log(this.registros[1].cursosCompletados);
  }

  calcularSumaPuntajes(): void {
    this.sumaPuntaje = this.form.puntajeComp.reduce((a, b) => a + Number(b), 0);
    this.desempeno = this.sumaPuntaje / 365;
    this.desempenoRedondeado = this.desempeno.toFixed(2);
    this.multiPuntajeyDias =
      Math.floor(this.desempeno * this.form.dias * 100) / 100;
  }

  calcularCursos(): void {
    this.form.cursos = 0;

    for (let i = 0; i <= this.Cursos.length - 1; i++) {
      var valCurso = document.getElementById('cursos_' + i) as HTMLInputElement;
      this.cursosCompletados[i] = valCurso.checked;
    }

    for (let i = 0; i < this.cursosCompletados.length; i++) {
      if (this.cursosCompletados[i] == true) {
        this.form.cursos += this.Cursos[i].puntaje;
      }
    }
  }

  seccionesImprimir(): void {
    const datosGenerales = document.getElementById(
      'datosGenerales'
    ) as HTMLInputElement;
    const desempenioLaboral = document.getElementById(
      'desempenioLaboral'
    ) as HTMLInputElement;
    const antiguedadEnElServicio = document.getElementById(
      'antiguedadEnElServicio'
    ) as HTMLInputElement;
    const preparacionAcademica = document.getElementById(
      'preparacionAcademica'
    ) as HTMLInputElement;
    const capacitacion = document.getElementById(
      'capacitacion'
    ) as HTMLInputElement;

    this.opcionesImprimir[0] = datosGenerales.checked;
    this.opcionesImprimir[1] = desempenioLaboral.checked;
    this.opcionesImprimir[2] = antiguedadEnElServicio.checked;
    this.opcionesImprimir[3] = preparacionAcademica.checked;
    this.opcionesImprimir[4] = capacitacion.checked;
  }

  sumarTodo(): void {
    this.form.resultadoTotal =
      Number(this.multiPuntajeyDias) +
      Number(this.antiguedad) +
      Number(this.academico) +
      Number(this.form.cursos);

    this.resultt = this.form.resultadoTotal.toFixed(2);
  }

  findKey(): void {
    this.centros.forEach((data) => {
      if (data.centro_de_trabajo === this.form.centrotrabajo) {
        this.form.clavecentro = data.clave_de_centro;
      }
    });
  }

  async generatePDF1(): Promise<void> {
    if (this.registros[0].tipoCentro === 'INSTITUCION EDUCATIVA') {
      const existingPdfBytes = await fetch('../../assets/formats/institucion.pdf').then(
        (res) => res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Realiza las modificaciones en el documento pdfDoc, como agregar texto, imágenes, etc.

      const page1 = pdfDoc.getPage(0);
      const page2 = pdfDoc.getPage(1);

      // Obtener la fuente estándar Helvetica
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaFontBold = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

      const nombrepersonal = [],
        resultadototal = [];
      for (const registro of this.registros) {
        nombrepersonal.push(registro.nombrepersonal);
        resultadototal.push(registro.resultadototal);
      }

      let y = page1.getHeight() - 126;
      let x = 117;
      let size = 7;

      for (let i = 0; i < nombrepersonal.length; i++) {
      let nombre = nombrepersonal[i];

      if (nombre.length >= 30 && nombre.length < 34) {
      size = 6.5;
       } else if (nombre.length >= 34) {
      size = 6;
      }

  if (nombre.length > 36) {
    const middleIndex = Math.floor(nombre.length / 2);
    let firstHalf = nombre.slice(0, middleIndex);
    let secondHalf = nombre.slice(middleIndex);

    const lastSpaceIndex = firstHalf.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      // Si hay un espacio en la primera mitad, partimos el nombre allí
      secondHalf = firstHalf.slice(lastSpaceIndex + 1) + secondHalf;
      firstHalf = firstHalf.slice(0, lastSpaceIndex);
    }

    nombre = firstHalf; // Actualizamos el nombre con la primera mitad ajustada
    page2.drawText(nombre, {
      x,
      y: y + 3, // Disminuimos la coordenada "y" para la primera mitad
      size: 6.5,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    // Dibujamos la segunda mitad del nombre
    nombre = secondHalf;
    page2.drawText(nombre, {
      x,
      y: y - 3, // Aumentamos la coordenada "y" para la segunda mitad
      size: 6.5,
      font: helveticaFont,
    });
    
  } else {
    // Si el nombre no necesita dividirse, lo dibujamos tal cual
    page2.drawText(nombre, {
      x,
      y,
      size,
      font: helveticaFont,
    });
  }

  y -= 13.9; // Después de dibujar el nombre (una mitad o completo), ajustamos la coordenada "y" para el siguiente elemento.

  if (i === 18) {
    // Cambiar la posición de x y y cuando el índice sea 18 (decimonoveno elemento)
    x = 310;
    y = page1.getHeight() - 126;
  }
  size = 7;
}
         
      x = 265;
      y = page1.getHeight() - 126;

      for (let i = 0; i < resultadototal.length; i++) {
        const puntaje = resultadototal[i];

        page2.drawText(puntaje, {
          x: x + 2,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= 13.9;

        if (i === 18) {
          // Cambiar la posición de x y y cuando el índice sea 2 (tercer elemento)
          x = 460; // Cambiar el valor de x
          y = page1.getHeight() - 126; // Cambiar el valor de y
        }
      }

      // Imprimir el valor de la variable centrotrabajo en el archivo PDF
      
      if (this.form.centrotrabajo.length > 49) {
        const valor = this.form.centrotrabajo.trim(); // Eliminamos los espacios en blanco al inicio y al final
        const mitad = Math.ceil(valor.length / 2); // Obtenemos la mitad redondeando hacia arriba
        let indiceUltimoEspacio = valor.lastIndexOf(" ", mitad); // Buscamos el último espacio antes de la mitad
      
        if (indiceUltimoEspacio === -1) {
          // Si no se encuentra un espacio antes de la mitad, buscar el próximo espacio después de la mitad
          indiceUltimoEspacio = valor.indexOf(" ", mitad);
        }
      
        const primeraMitad = valor.substr(0, indiceUltimoEspacio);
        const segundaMitad = valor.substr(indiceUltimoEspacio + 1);
      
        page1.drawText(primeraMitad, {
          x: 193,
          y: 540,
          size: 9,
          font: helveticaFont,
        });
      
        page1.drawText(segundaMitad, {
          x: 193,
          y: 532,
          size: 9,
          font: helveticaFont,
        });
           
      } else if (this.form.centrotrabajo.length >= 40 && this.form.centrotrabajo.length <= 49) {
        page1.drawText(this.form.centrotrabajo, {
          x: 193,
          y: 532,
          size: 8,
          font: helveticaFont,
        });
      }else {
        page1.drawText(this.form.centrotrabajo, {
          x: 196,
          y: 532,
          size: 10,
          font: helveticaFont,
        });
      }
	
	if(this.calle.length >= 24){
      page1.drawText(this.calle, {
        x: 324,
        y: 501,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.calle, {
        x: 324,
        y: 501,
        size: 10,
        font: helveticaFont,
      });
    }

    if(this.colonia.length >= 26){
      page1.drawText(this.colonia, {
        x: 122,
        y: 486,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.colonia, {
        x: 122,
        y: 486,
        size: 10,
        font: helveticaFont,
    });
  }

    if(this.director.length >= 34){
      page1.drawText(this.director, {
        x: 249,
        y: 379,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.director, {
        x: 249,
        y: 379,
        size: 10,
        font: helveticaFont,
      });
    }
    
    if(this.representdocente.length >= 39 ){
      page1.drawText(this.representdocente, {
        x: 177,
        y: 363,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.representdocente, {
        x: 177,
        y: 363,
        size: 10,
        font: helveticaFont,
      });
    }
    
    if(this.represetsindical.length >=47){
      page1.drawText(this.represetsindical, {
        x: 169,
        y: 347,
        size: 9,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.represetsindical, {
        x: 169,
        y: 347,
        size: 10,
        font: helveticaFont,
      });
    }

    //Campo Observaciones

    const chunkSize = 100;
    let yy = 380; // Valor inicial de y  
    let remainingText = this.observacionesacta.replace(/\n/g, ' ');
while (remainingText.length > 0) {
  let chunk = remainingText.substring(0, chunkSize);
  if (chunk.length >= chunkSize) {
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      chunk = chunk.substring(0, lastSpaceIndex);
    }
  }
  if (chunk.charAt(0) === ' ') {
    chunk = chunk.substring(1);
  }
  page2.drawText(chunk, {
    x: 97,
    y: yy,
    size: 10,
    font: helveticaFont,
  });
  remainingText = remainingText.substring(chunk.length).trim();
      yy -= 9.5; // Disminuye el valor de y en 9.5 puntos
    }

      page1.drawText(this.form.clavecentro, {
        x: 315,
        y: 470,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.form.municipio, {
        x: 375,
        y: 486,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.numcalle.toString(), {
        x: 477,
        y: 501,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.turno, {
        x: 460,
        y: 470,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.hora.toString(), {
        x: 500,
        y: 532,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.minutos.toString(), {
        x: 160,
        y: 517,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.zona.toString(), {
        x: 130,
        y: 455,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.registros.length.toString(), {
        x: 210,
        y: 393,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.hora2.toString(), {
        x: 100,
        y: 308,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.minutos2.toString(), {
        x: 180,
        y: 308,
        size: 10,
        font: helveticaFont,
      });

      const fechaInicio = new Date(this.fechaInicioActa);
      const dia1 = fechaInicio.getDate();
      const mes1 = fechaInicio.toLocaleString('es', { month: 'long' });

      const fechaFin = new Date(this.fechaFinActa);
      const dia2 = fechaFin.getDate();
      const mes2 = fechaFin.toLocaleString('es', { month: 'long' });

      page1.drawText(dia1.toString(), {
        x: 278,
        y: 517,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(mes1.toString(), {
        x: 322,
        y: 517,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(dia2.toString(), {
        x: 283,
        y: 323,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(mes2.toString(), {
        x: 360,
        y: 323,
        size: 10,
        font: helveticaFont,
      });

      ///// Inician datos de admin

      if (this.datosgenerales_Backend.etapaConLetra.split(' ').length === 2) {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, { //Caso ordinales base 10
         x: 267,
         y: 582, 
         size: 10,
         font: helveticaFontBold,
       });
      } else {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, {
          x: 249,
          y: 582,
         size: 10,
          font: helveticaFontBold,
        });
      }

      page1.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 363,
       y: 516,
        size: 10,
        font: helveticaFont,
      });

      const palabras = this.datosgenerales_Backend.etapaConLetra.split(' ');
      if (palabras.length === 3){
      page1.drawText(palabras[0], {
        x: 484, 
        y: 455, 
        size: 9.4,
        font: helveticaFontBold,
      });
      page1.drawText(palabras[1], {
        x: 85, 
        y: 439.5, 
        size: 9.2,
        font: helveticaFontBold,
      });
    }else{
      page1.drawText(palabras[0], {
        x: 484, 
        y: 455, 
        size: 9.4,
        font: helveticaFontBold,
      });
    }

      page2.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 447,
        y: 323.5,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.datosgenerales_Backend.fechaLimite, {
        x: 289.8,
        y: 294.8,
        size: 8.1,
        font: helveticaFontBold,
      });
      //// Terminan datos de admin

      const modifiedPdfBytes = await pdfDoc.save();

      // Descargar el archivo modificado
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FACOEPAB-001_${this.registros[0].centrotrabajo}.pdf`;
      link.click();
    } else if (
      this.registros[0].tipoCentro ===
      'DELEGACION REGIONAL, OFICINA CENTRAL, USAE y CEDE'
    ) {
      const existingPdfBytes = await fetch('../../assets/formats/centrales.pdf').then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Realiza las modificaciones en el documento pdfDoc, como agregar texto, imágenes, etc.

      const page1 = pdfDoc.getPage(0);
      const page2 = pdfDoc.getPage(1);

      // Obtener la fuente estándar Helvetica
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaFontBold = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

      const nombrepersonal = [],
        resultadototal = [];

      for (const registro of this.registros) {
        nombrepersonal.push(registro.nombrepersonal);
        resultadototal.push(registro.resultadototal);
      }

      let y = page1.getHeight() - 156;
      let x = 117;
      let size = 7;

      for (let i = 0; i < nombrepersonal.length; i++) {
      let nombre = nombrepersonal[i];

      if (nombre.length >= 30 && nombre.length < 34) {
      size = 6.5;
       } else if (nombre.length >= 34) {
      size = 6;
      }

  if (nombre.length > 36) {
    const middleIndex = Math.floor(nombre.length / 2);
    let firstHalf = nombre.slice(0, middleIndex);
    let secondHalf = nombre.slice(middleIndex);

    const lastSpaceIndex = firstHalf.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      // Si hay un espacio en la primera mitad, partimos el nombre allí
      secondHalf = firstHalf.slice(lastSpaceIndex + 1) + secondHalf;
      firstHalf = firstHalf.slice(0, lastSpaceIndex);
    }

    nombre = firstHalf; // Actualizamos el nombre con la primera mitad ajustada
    page2.drawText(nombre, {
      x,
      y: y + 3, // Disminuimos la coordenada "y" para la primera mitad
      size: 6.5,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    // Dibujamos la segunda mitad del nombre
    nombre = secondHalf;
    page2.drawText(nombre, {
      x,
      y: y - 3, // Aumentamos la coordenada "y" para la segunda mitad
      size: 6.5,
      font: helveticaFont,
    });
    
  } else {
    // Si el nombre no necesita dividirse, lo dibujamos tal cual
    page2.drawText(nombre, {
      x,
      y,
      size,
      font: helveticaFont,
    });
  }

  y -= 13.9; // Después de dibujar el nombre (una mitad o completo), ajustamos la coordenada "y" para el siguiente elemento.

  if (i === 18) {
    // Cambiar la posición de x y y cuando el índice sea 18 (decimonoveno elemento)
    x = 310;
    y = page1.getHeight() - 156;
  }
  size = 7;
}

      x = 265;
      y = page1.getHeight() - 156;

      for (let i = 0; i < resultadototal.length; i++) {
        const puntaje = resultadototal[i];

        page2.drawText(puntaje, {
          x: x + 2,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= +14;

        if (i === 18) {
          // Cambiar la posición de x y y cuando el índice sea 2 (tercer elemento)
          x = 460; // Cambiar el valor de x
          y = page1.getHeight() - 156; // Cambiar el valor de y
        }
      }
      // Imprimir el valor de la variable centrotrabajo en el archivo PDF
      if (this.form.centrotrabajo.length > 49) {
        const valor = this.form.centrotrabajo.trim(); // Eliminamos los espacios en blanco al inicio y al final
      
        const mitad = Math.ceil(valor.length / 2); // Obtenemos la mitad redondeando hacia arriba
        let indiceUltimoEspacio = valor.lastIndexOf(" ", mitad); // Buscamos el último espacio antes de la mitad
      
        if (indiceUltimoEspacio === -1) {
          // Si no se encuentra un espacio antes de la mitad, buscar el próximo espacio después de la mitad
          indiceUltimoEspacio = valor.indexOf(" ", mitad);
        }
      
        const primeraMitad = valor.substr(0, indiceUltimoEspacio);
        const segundaMitad = valor.substr(indiceUltimoEspacio + 1);
      
        page1.drawText(primeraMitad, {
          x: 193,
          y: 529,
          size: 9,
          font: helveticaFont,
        });
    
        page1.drawText(segundaMitad, {
          x: 193,
          y: 521,
          size: 9,
          font: helveticaFont,
        });
           
      } else if (this.form.centrotrabajo.length >= 40 && this.form.centrotrabajo.length <= 49) {
        page1.drawText(this.form.centrotrabajo, {
          x: 193,
          y: 521,
          size: 8,
          font: helveticaFont,
        });
      }else {
        page1.drawText(this.form.centrotrabajo, {
          x: 196,
          y: 521,
          size: 10,
          font: helveticaFont,
        });
      }

    if(this.calle.length >= 24){
      page1.drawText(this.calle, {
        x: 324,
        y: 491,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.calle, {
        x: 324,
        y: 491,
        size: 10,
        font: helveticaFont,
      });
    }

    if(this.colonia.length >= 26){
      page1.drawText(this.colonia, {
        x: 121,
        y: 475,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.colonia, {
        x: 121,
        y: 475,
        size: 10,
        font: helveticaFont,
    });
  }

    if(this.director.length >= 39){
      page1.drawText(this.director, {
        x: 242,
        y: 367,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.director, {
        x: 242,
        y: 367,
        size: 10,
        font: helveticaFont,
      });
    }
    
    if(this.represetsindical.length >=38){
      page1.drawText(this.represetsindical, {
        x: 220,
        y: 351,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.represetsindical, {
        x: 220,
        y: 351,
        size: 10,
        font: helveticaFont,
      });
    }

    //Campo Observaciones

    const chunkSize = 100;
    let yy = 338; // Valor inicial de y
    
    let remainingText = this.observacionesacta.replace(/\n/g, ' ');
while (remainingText.length > 0) {
  let chunk = remainingText.substring(0, chunkSize);

  if (chunk.length >= chunkSize) {
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      chunk = chunk.substring(0, lastSpaceIndex);
    }
  }

  if (chunk.charAt(0) === ' ') {
    chunk = chunk.substring(1);
  }

  page2.drawText(chunk, {
    x: 94,
    y: yy,
    size: 10,
    font: helveticaFont,
  });

  remainingText = remainingText.substring(chunk.length).trim();
      yy -= 9.5; // Disminuye el valor de y en 9.5 puntos
    }

      page1.drawText(this.form.clavecentro, {
        x: 275,
        y: 460,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.form.municipio, {
        x: 375,
        y: 475,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.numcalle.toString(), {
        x: 477,
        y: 491,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.hora.toString(), {
        x: 503,
        y: 522,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.minutos.toString(), {
        x: 160,
        y: 506,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.registros.length.toString(), {
        x: 360,
        y: 398,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.hora2.toString(), {
        x: 100,
        y: 262,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.minutos2.toString(), {
        x: 180,
        y: 262,
        size: 10,
        font: helveticaFont,
      });

      const fechaInicio = new Date(this.fechaInicioActa);
      const dia1 = fechaInicio.getDate();
      const mes1 = fechaInicio.toLocaleString('es', { month: 'long' });

      const fechaFin = new Date(this.fechaFinActa);
      const dia2 = fechaFin.getDate();
      const mes2 = fechaFin.toLocaleString('es', { month: 'long' });

      page1.drawText(dia1.toString(), {
        x: 278,
        y: 506,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(mes1.toString(), {
        x: 322,
        y: 506,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(dia2.toString(), {
        x: 283,
        y: 277,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(mes2.toString(), {
        x: 360,
        y: 277,
        size: 10,
        font: helveticaFont,
      });

      ///// Inician datos de admin

      if (this.datosgenerales_Backend.etapaConLetra.split(' ').length === 2) {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, { //Caso ordinales base 10
         x: 267,
         y: 571, 
         size: 10,
         font: helveticaFontBold,
       });
      } else {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, {
          x: 250.2,
          y: 571,
         size: 10,
          font: helveticaFontBold,
        });
      }

      page1.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 363,
       y: 505.7,
        size: 10,
        font: helveticaFont,
      });

      const palabrasEtapaTexto = this.datosgenerales_Backend.etapaConLetra.split(' ');
      let primeraPalabra = palabrasEtapaTexto.length > 1 ? palabrasEtapaTexto.slice(0, -1).join(' ') : this.datosgenerales_Backend.etapaConLetra; //EXCLUIR LA PALABRA "ETAPA"
      page1.drawText(primeraPalabra, {
        x: 240,
        y: 444,
        size: 9.6,
        font: helveticaFontBold,
      });

      page2.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 447.5,
        y: 277,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.datosgenerales_Backend.fechaLimite, {
        x: 289.8,
        y: 225.5,
        size: 8.1,
        font: helveticaFontBold,
      });
      //// Terminan datos de admin

      const modifiedPdfBytes = await pdfDoc.save();

      // Descargar el archivo modificado
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FACOEPAB-001_${this.registros[0].centrotrabajo}.pdf`;
      link.click();
    } else if (
      this.registros[0].tipoCentro === 'SUPERVISION Y JEFATURA DE SECTOR'
    ) {
      const existingPdfBytes = await fetch('../../assets/formats/jefaturas.pdf').then(
        (res) => res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Realiza las modificaciones en el documento pdfDoc, como agregar texto, imágenes, etc.

      const page1 = pdfDoc.getPage(0);
      const page2 = pdfDoc.getPage(1);

      // Obtener la fuente estándar Helvetica
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaFontBold = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

      const nombrepersonal = [],
        resultadototal = [];
      for (const registro of this.registros) {
        nombrepersonal.push(registro.nombrepersonal);
        resultadototal.push(registro.resultadototal);
      }

      
let y = page1.getHeight() - 126;
let x = 117;
let size = 7;

for (let i = 0; i < nombrepersonal.length; i++) {
let nombre = nombrepersonal[i];

if (nombre.length >= 30 && nombre.length < 34) {
size = 6.5;
 } else if (nombre.length >= 34) {
size = 6;
}

if (nombre.length > 36) {
const middleIndex = Math.floor(nombre.length / 2);
let firstHalf = nombre.slice(0, middleIndex);
let secondHalf = nombre.slice(middleIndex);

const lastSpaceIndex = firstHalf.lastIndexOf(' ');
if (lastSpaceIndex !== -1) {
// Si hay un espacio en la primera mitad, partimos el nombre allí
secondHalf = firstHalf.slice(lastSpaceIndex + 1) + secondHalf;
firstHalf = firstHalf.slice(0, lastSpaceIndex);
}

nombre = firstHalf; // Actualizamos el nombre con la primera mitad ajustada
page2.drawText(nombre, {
x,
y: y + 3, // Disminuimos la coordenada "y" para la primera mitad
size: 6.5,
font: helveticaFont,
color: rgb(0, 0, 0),
});
// Dibujamos la segunda mitad del nombre
nombre = secondHalf;
page2.drawText(nombre, {
x,
y: y - 3, // Aumentamos la coordenada "y" para la segunda mitad
size: 6.5,
font: helveticaFont,
});

} else {
// Si el nombre no necesita dividirse, lo dibujamos tal cual
page2.drawText(nombre, {
x,
y,
size,
font: helveticaFont,
});
}

y -= 13.9; // Después de dibujar el nombre (una mitad o completo), ajustamos la coordenada "y" para el siguiente elemento.

if (i === 18) {
// Cambiar la posición de x y y cuando el índice sea 18 (decimonoveno elemento)
x = 310;
y = page1.getHeight() - 126;
}
size = 7;
}

      x = 265;
      y = page1.getHeight() - 126;

      for (let i = 0; i < resultadototal.length; i++) {
        const puntaje = resultadototal[i];

        page2.drawText(puntaje, {
          x: x + 2,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= +14;

        if (i === 18) {
          // Cambiar la posición de x y y cuando el índice sea 2 (tercer elemento)
          x = 460; // Cambiar el valor de x
          y = page1.getHeight() - 126; // Cambiar el valor de y
        }
      }

      // Imprimir el valor de la variable centrotrabajo en el archivo PDF

      if (this.form.centrotrabajo.length > 49) {
        const valor = this.form.centrotrabajo.trim(); // Eliminamos los espacios en blanco al inicio y al final
      
        const mitad = Math.ceil(valor.length / 2); // Obtenemos la mitad redondeando hacia arriba
        let indiceUltimoEspacio = valor.lastIndexOf(" ", mitad); // Buscamos el último espacio antes de la mitad
      
        if (indiceUltimoEspacio === -1) {
          // Si no se encuentra un espacio antes de la mitad, buscar el próximo espacio después de la mitad
          indiceUltimoEspacio = valor.indexOf(" ", mitad);
        }
      
        const primeraMitad = valor.substr(0, indiceUltimoEspacio);
        const segundaMitad = valor.substr(indiceUltimoEspacio + 1);
      
        page1.drawText(primeraMitad, {
          x: 193,
          y: 533,
          size: 9,
          font: helveticaFont,
        });
      
        page1.drawText(segundaMitad, {
          x: 193,
          y: 525,
          size: 9,
          font: helveticaFont,
        });
           
      } else if (this.form.centrotrabajo.length >= 40 && this.form.centrotrabajo.length <= 49) {
        page1.drawText(this.form.centrotrabajo, {
          x: 193,
          y: 525,
          size: 8,
          font: helveticaFont,
        });
      }else {
        page1.drawText(this.form.centrotrabajo, {
          x: 196,
          y: 525,
          size: 10,
          font: helveticaFont,
        });
      }

   if(this.calle.length >= 24){
      page1.drawText(this.calle, {
        x: 325,
        y: 494,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.calle, {
        x: 325,
        y: 494,
        size: 10,
        font: helveticaFont,
      });
    }

    if(this.colonia.length >= 26){
      page1.drawText(this.colonia, {
        x: 122,
        y: 479,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.colonia, {
        x: 122,
        y: 479,
        size: 10,
        font: helveticaFont,
    });
  }

    if(this.director.length >= 34){
      page1.drawText(this.director, {
        x: 215,
        y: 370,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.director, {
        x: 215,
        y: 370,
        size: 10,
        font: helveticaFont,
      });
    }
    
    if(this.represetsindical.length >=47){
      page1.drawText(this.represetsindical, {
        x: 166,
        y: 355,
        size: 8,
        font: helveticaFont,
      });
    }else{
      page1.drawText(this.represetsindical, {
        x: 166,
        y: 355,
        size: 10,
        font: helveticaFont,
      });
    }

    //Campo Observaciones

    const chunkSize = 100;
    let yy = 370; // Valor inicial de y
    
    let remainingText = this.observacionesacta.replace(/\n/g, ' ');
while (remainingText.length > 0) {
  let chunk = remainingText.substring(0, chunkSize);

  if (chunk.length >= chunkSize) {
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      chunk = chunk.substring(0, lastSpaceIndex);
    }
  }

  if (chunk.charAt(0) === ' ') {
    chunk = chunk.substring(1);
  }

  page2.drawText(chunk, {
    x: 94,
    y: yy,
    size: 10,
    font: helveticaFont,
  });

  remainingText = remainingText.substring(chunk.length).trim();
      yy -= 9.5; // Disminuye el valor de y en 9.5 puntos
    }

      page1.drawText(this.form.clavecentro, {
        x: 315,
        y: 464,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.form.municipio, {
        x: 375,
        y: 479,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.numcalle.toString(), {
        x: 477,
        y: 494,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.turno, {
        x: 460,
        y: 464,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.hora.toString(), {
        x: 500,
        y: 525,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.minutos.toString(), {
        x: 160,
        y: 510,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.zona.toString(), {
        x: 130,
        y: 448,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.registros.length.toString(), {
        x: 160,
        y: 387,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.hora2.toString(), {
        x: 100,
        y: 293,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.minutos2.toString(), {
        x: 180,
        y: 293,
        size: 10,
        font: helveticaFont,
      });

      const fechaInicio = new Date(this.fechaInicioActa);
      const dia1 = fechaInicio.getDate();
      const mes1 = fechaInicio.toLocaleString('es', { month: 'long' });

      const fechaFin = new Date(this.fechaFinActa);
      const dia2 = fechaFin.getDate();
      const mes2 = fechaFin.toLocaleString('es', { month: 'long' });

      page1.drawText(dia1.toString(), {
        x: 278,
        y: 510,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(mes1.toString(), {
        x: 322,
        y: 510,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(dia2.toString(), {
        x: 283,
        y: 309,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(mes2.toString(), {
        x: 360,
        y: 309,
        size: 10,
        font: helveticaFont,
      });

 ///// Inician datos de admin

 if (this.datosgenerales_Backend.etapaConLetra.split(' ').length === 2) {
  page1.drawText(this.datosgenerales_Backend.etapaConLetra, { //Caso ordinales base 10
   x: 267,
   y: 574.9, 
   size: 10,
   font: helveticaFontBold,
 });
} else {
  page1.drawText(this.datosgenerales_Backend.etapaConLetra, {
    x: 249,
    y: 574.9,
   size: 10,
    font: helveticaFontBold,
  });
}

page1.drawText(this.datosgenerales_Backend.anio.toString(), {
  x: 363,
  y: 509.7,
  size: 10,
  font: helveticaFont,
});

const palabras = this.datosgenerales_Backend.etapaConLetra.split(' ');
if (palabras.length === 3){
page1.drawText(palabras[0], {
  x: 483, 
  y: 448, 
  size: 9.4,
  font: helveticaFontBold,
});
page1.drawText(palabras[1], {
  x: 85, 
  y: 432.5, 
  size: 9.2,
  font: helveticaFontBold,
});
}else{
page1.drawText(palabras[0], {
  x: 483, 
  y: 448, 
  size: 9.4,
  font: helveticaFontBold,
});
}

page2.drawText(this.datosgenerales_Backend.anio.toString(), {
  x: 447,
  y: 308,
  size: 10,
  font: helveticaFont,
});
page2.drawText(this.datosgenerales_Backend.fechaLimite, {
  x: 289.8,
  y: 279.1,
  size: 8.1,
  font: helveticaFontBold,
});
//// Terminan datos de admin

      const modifiedPdfBytes = await pdfDoc.save();

      // Descargar el archivo modificado
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FACOEPAB-001_${this.registros[0].centrotrabajo}.pdf`;
      link.click();
    } else if (this.registros[0].tipoCentro === 'SNTE') {
      const existingPdfBytes = await fetch('../../assets/formats/snte.pdf').then(
        (res) => res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Realiza las modificaciones en el documento pdfDoc, como agregar texto, imágenes, etc.

      const page1 = pdfDoc.getPage(0);
      const page2 = pdfDoc.getPage(1);

      // Obtener la fuente estándar Helvetica
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaFontBold = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

      const nombrepersonal = [],
        resultadototal = [];
      for (const registro of this.registros) {
        nombrepersonal.push(registro.nombrepersonal);
        resultadototal.push(registro.resultadototal);
      }

      let y = page1.getHeight() - 141;
      let x = 117;
      let size = 7;

      for (let i = 0; i < nombrepersonal.length; i++) {
      let nombre = nombrepersonal[i];

      if (nombre.length >= 30 && nombre.length < 34) {
      size = 6.5;
       } else if (nombre.length >= 34) {
      size = 6;
      }

  if (nombre.length > 36) {
    const middleIndex = Math.floor(nombre.length / 2);
    let firstHalf = nombre.slice(0, middleIndex);
    let secondHalf = nombre.slice(middleIndex);

    const lastSpaceIndex = firstHalf.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      // Si hay un espacio en la primera mitad, partimos el nombre allí
      secondHalf = firstHalf.slice(lastSpaceIndex + 1) + secondHalf;
      firstHalf = firstHalf.slice(0, lastSpaceIndex);
    }

    nombre = firstHalf; // Actualizamos el nombre con la primera mitad ajustada
    page2.drawText(nombre, {
      x,
      y: y + 3, // Disminuimos la coordenada "y" para la primera mitad
      size: 6.5,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    // Dibujamos la segunda mitad del nombre
    nombre = secondHalf;
    page2.drawText(nombre, {
      x,
      y: y - 3, // Aumentamos la coordenada "y" para la segunda mitad
      size: 6.5,
      font: helveticaFont,
    });
    
  } else {
    // Si el nombre no necesita dividirse, lo dibujamos tal cual
    page2.drawText(nombre, {
      x,
      y,
      size,
      font: helveticaFont,
    });
  }

  y -= 13.9; // Después de dibujar el nombre (una mitad o completo), ajustamos la coordenada "y" para el siguiente elemento.

  if (i === 18) {
    // Cambiar la posición de x y y cuando el índice sea 18 (decimonoveno elemento)
    x = 310;
    y = page1.getHeight() - 141;
  }
  size = 7;
}

      x = 265;
      y = page1.getHeight() - 141;

      for (let i = 0; i < resultadototal.length; i++) {
        const puntaje = resultadototal[i];

        page2.drawText(puntaje, {
          x: x + 2,
          y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= +14;

        if (i === 18) {
          // Cambiar la posición de x y y cuando el índice sea 2 (tercer elemento)
          x = 460; // Cambiar el valor de x
          y = page1.getHeight() - 141; // Cambiar el valor de y
        }
      }

      // Imprimir el valor de la variable centrotrabajo en el archivo PDF

      if (this.form.centrotrabajo.length > 49) {
        const valor = this.form.centrotrabajo.trim(); // Eliminamos los espacios en blanco al inicio y al final
      
        const mitad = Math.ceil(valor.length / 2); // Obtenemos la mitad redondeando hacia arriba
        let indiceUltimoEspacio = valor.lastIndexOf(" ", mitad); // Buscamos el último espacio antes de la mitad
      
        if (indiceUltimoEspacio === -1) {
          // Si no se encuentra un espacio antes de la mitad, buscar el próximo espacio después de la mitad
          indiceUltimoEspacio = valor.indexOf(" ", mitad);
        }
      
        const primeraMitad = valor.substr(0, indiceUltimoEspacio);
        const segundaMitad = valor.substr(indiceUltimoEspacio + 1);
      
        page1.drawText(primeraMitad, {
          x: 193,
          y: 533,
          size: 9,
          font: helveticaFont,
        });
      
        page1.drawText(segundaMitad, {
          x: 193,
          y: 525,
          size: 9,
          font: helveticaFont,
        });
           
      } else if (this.form.centrotrabajo.length >= 40 && this.form.centrotrabajo.length <= 49) {
        page1.drawText(this.form.centrotrabajo, {
          x: 193,
          y: 525,
          size: 8,
          font: helveticaFont,
        });
      }else {
        page1.drawText(this.form.centrotrabajo, {
          x: 196,
          y: 525,
          size: 10,
          font: helveticaFont,
        });
      }
	
      if(this.calle.length >= 24){
        page1.drawText(this.calle, {
          x: 324,
          y: 494,
          size: 8,
          font: helveticaFont,
        });
      }else{
        page1.drawText(this.calle, {
          x: 324,
          y: 494,
          size: 10,
          font: helveticaFont,
        });
      }
  
      if(this.colonia.length >= 27){
        page1.drawText(this.colonia, {
          x: 120,
          y: 479,
          size: 8,
          font: helveticaFont,
        });
      }else{
        page1.drawText(this.colonia, {
          x: 120,
          y: 479,
          size: 10,
          font: helveticaFont,
      });
    }
  
      if(this.director.length >= 35){
        page1.drawText(this.director, {
          x: 83,
          y: 356,
          size: 8,
          font: helveticaFont,
        });
      }else{
        page1.drawText(this.director, {
          x: 83,
          y: 356,
          size: 10,
          font: helveticaFont,
        });
      }
      
      if(this.represetsindical.length >=48){
        page1.drawText(this.represetsindical, {
          x: 83,
          y: 340,
          size: 8,
          font: helveticaFont,
        });
      }else{
        page1.drawText(this.represetsindical, {
          x: 83,
          y: 340,
          size: 10,
          font: helveticaFont,
        });
      }
  
      //Campo Observaciones
  
      const chunkSize = 100;
      let yy = 368; // Valor inicial de y
      
      let remainingText = this.observacionesacta.replace(/\n/g, ' ');
  while (remainingText.length > 0) {
    let chunk = remainingText.substring(0, chunkSize);
  
    if (chunk.length >= chunkSize) {
      const lastSpaceIndex = chunk.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        chunk = chunk.substring(0, lastSpaceIndex);
      }
    }
  
    if (chunk.charAt(0) === ' ') {
      chunk = chunk.substring(1);
    }
  
    page2.drawText(chunk, {
      x: 94,
      y: yy,
      size: 10,
      font: helveticaFont,
    });
  
    remainingText = remainingText.substring(chunk.length).trim();
        yy -= 9.5; // Disminuye el valor de y en 9.5 puntos
      }

      page1.drawText(this.form.clavecentro, {
        x: 285,
        y: 464,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.form.municipio, {
        x: 375,
        y: 479,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.numcalle.toString(), {
        x: 477,
        y: 494,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.hora.toString(), {
        x: 500,
        y: 527,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.minutos.toString(), {
        x: 160,
        y: 511,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(this.registros.length.toString(), {
        x: 365,
        y: 401,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.hora2.toString(), {
        x: 100,
        y: 293,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.minutos2.toString(), {
        x: 180,
        y: 293,
        size: 10,
        font: helveticaFont,
      });

      const fechaInicio = new Date(this.fechaInicioActa);
      const dia1 = fechaInicio.getDate();
      const mes1 = fechaInicio.toLocaleString('es', { month: 'long' });

      const fechaFin = new Date(this.fechaFinActa);
      const dia2 = fechaFin.getDate();
      const mes2 = fechaFin.toLocaleString('es', { month: 'long' });

      page1.drawText(dia1.toString(), {
        x: 278,
        y: 511,
        size: 10,
        font: helveticaFont,
      });
      page1.drawText(mes1.toString(), {
        x: 322,
        y: 511,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(dia2.toString(), {
        x: 283,
        y: 308,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(mes2.toString(), {
        x: 360,
        y: 308,
        size: 10,
        font: helveticaFont,
      });

      ///// Inician datos de admin

      if (this.datosgenerales_Backend.etapaConLetra.split(' ').length === 2) {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, { //Caso ordinales base 10
         x: 267,
         y: 575, 
         size: 10,
         font: helveticaFontBold,
       });
      } else {
        page1.drawText(this.datosgenerales_Backend.etapaConLetra, {
          x: 250,
          y: 575,
         size: 10,
          font: helveticaFontBold,
        });
      }

      page1.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 363,
       y: 509.5,
        size: 10,
        font: helveticaFont,
      });

      const palabrasEtapaTexto = this.datosgenerales_Backend.etapaConLetra.split(' ');
      let primeraPalabra = palabrasEtapaTexto.length > 1 ? palabrasEtapaTexto.slice(0, -1).join(' ') : this.datosgenerales_Backend.etapaConLetra; //EXCLUIR LA PALABRA "ETAPA"
      page1.drawText(primeraPalabra, {
        x: 240,
        y: 448,
        size: 9.6,
        font: helveticaFontBold,
      });

      page2.drawText(this.datosgenerales_Backend.anio.toString(), {
        x: 447,
        y: 308,
        size: 10,
        font: helveticaFont,
      });
      page2.drawText(this.datosgenerales_Backend.fechaLimite, {
        x: 289.8,
        y: 279.1,
        size: 8.1,
        font: helveticaFontBold,
      });
      //// Terminan datos de admin

      const modifiedPdfBytes = await pdfDoc.save();

      // Descargar el archivo modificado
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FACOEPAB-001_${this.registros[0].centrotrabajo}.pdf`;
      link.click();
    }
  }

  async generateAllPDF(): Promise<void> {
    const existingPdfBytes = await fetch(
      '../../assets/formats/4factores.pdf'
    ).then((res) => res.arrayBuffer());

    for (const registro of this.registros) {
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaFontBold = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );
      const page1 = pdfDoc.getPage(0);
      const page2 = pdfDoc.getPage(1);

      if (this.opcionesImprimir[0] == true) {
        page1.drawText(this.datosgenerales_Backend.anio.toString(), {
          x: 357,
          y: page1.getHeight() - 92,
          size: 5,
          font: helveticaFontBold,
          color: rgb(0, 0, 0),
        });
        page1.drawText(this.datosgenerales_Backend.anio.toString(), {
          x: 317.5,
          y: page1.getHeight() - 705.6,
          size: 5.2,
          font: helveticaFontBold,
          color: rgb(0.5, 0, 0),
        });        
        page1.drawText(this.datosgenerales_Backend.periodoEvaluado.toString(), {
          x: 293,
          y: page1.getHeight() - 168,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });
        page1.drawText(this.datosgenerales_Backend.etapa.toString(), {
          x: 192,
          y: page1.getHeight() - 110,
          size: 5,
          font: helveticaFontBold,
          color: rgb(0, 0, 0),
        });

        page1.drawText(this.datosgenerales_Backend.municipio.toString(), {
          x: 64,
          y: page1.getHeight() - 185.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });
             //////INICIA IMPRESIÓN DE NOMBRES DE CURSOS
     let nombresCursos = '';
     for (let i = 0; i < this.Cursos.length; i++) {
       nombresCursos += '"'+this.Cursos[i].nombre + '", '; // Concatenar el nombre del curso y una coma
     }
       nombresCursos = nombresCursos.substring(0, nombresCursos.length - 2);
     
     const chunkSize = 48;
     let y = page1.getHeight() - 409 ; // Valor inicial de y
     
     let remainingText = nombresCursos;
     while (remainingText.length > 0) {
     let chunk = remainingText.substring(0, chunkSize);
     
     if (chunk.length >= chunkSize) {
     const lastSpaceIndex = chunk.lastIndexOf(' ');
     if (lastSpaceIndex !== -1) {
       chunk = chunk.substring(0, lastSpaceIndex);
     }
     }
     
     if (chunk.charAt(0) === ' ') {
     chunk = chunk.substring(1);
     }
     
     page2.drawText(chunk, {
     x: 300,
     y: y,
     size: 5.7,
     font: helveticaFont,
     });
     
     remainingText = remainingText.substring(chunk.length).trim();
       y -= 6.5; // Disminuye el valor de y en 4 puntos
     }
     
     if(this.Cursos.length === 1){
       page2.drawText('Puntos Obtenidos cuando compruebe el curso',{
         x: 300,
         y: page1.getHeight() - 402.5,
         size: 5.7,
         font: helveticaFont,
       });
     }else {
     page2.drawText('Puntos Obtenidos cuando compruebe los cursos',{
       x: 300,
       y: page1.getHeight() - 402.5,
       size: 5.7,
       font: helveticaFont,
     });}
     
     //////////////////////TERMINA IMPRESIÓN DE NOMBRES DE CURSOS
     
     let sumaPuntajesCursos = 0;
     // Recorre el arreglo de Cursos y suma los puntajes
     for (let i = 0; i < this.Cursos.length; i++) {
       sumaPuntajesCursos += this.Cursos[i].puntaje;
     }
     
     page2.drawText(sumaPuntajesCursos.toString(),{
       x: 478.5,
       y: page1.getHeight() - 376,
       size: 5.2,
       font: helveticaFontBold,
     });
     
     page2.drawText(this.TotalPreparacionAcademica.toString(),{
       x: 513,
       y: page1.getHeight() - 340.3,
       size: 4.8,
       font: helveticaFontBold,
     });
        
        if(registro.nombrepersonal.length >= 34){
          page1.drawText(registro.nombrepersonal, {
            x: 96.5,
            y: page1.getHeight() - 133,
            size: 4.7,
            font: helveticaFont,
            color: rgb(0, 0, 0.5),
          });
        } else{
          page1.drawText(registro.nombrepersonal, {
            x: 98,
            y: page1.getHeight() - 133,
            size: 6.5,
            font: helveticaFont,
            color: rgb(0, 0, 0.5),
          });
        }
       
        if (registro.centrotrabajo.length >= 60) {
          page1.drawText(registro.centrotrabajo, {
            x: 326,
            y: page1.getHeight() - 132.5,
            size: 4.9,
            font: helveticaFont,
            color: rgb(0, 0, 0.5),
          });
        } else {
          page1.drawText(registro.centrotrabajo, {
            x: 327,
            y: page1.getHeight() - 132.5,
            size: 6,
            font: helveticaFont,
            color: rgb(0, 0, 0.5),
          });
        }

        if (Number(registro.seccionsindical) === 45) {
          // 45
          page1.drawText(`X`, {
            x: 113,
            y: page1.getHeight() - 150,
            size: 8,
            font: helveticaFontBold,
            color: rgb(0, 0, 0.5),
          });
        } else {
          // 13
          page1.drawText(`X`, {
            x: 187,
            y: page1.getHeight() - 150,
            size: 8,
            font: helveticaFontBold,
            color: rgb(0, 0, 0.5),
          });
        }

        page1.drawText(registro.evaluador, {
          x: 306,
          y: page1.getHeight() - 150.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.rfc, {
          x: 96,
          y: page1.getHeight() - 168.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.fechaFormateada, {
          x: 260,
          y: page1.getHeight() - 185.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });
        page1.drawText(registro.funcion, {
          x: 60,
          y: page1.getHeight() - 201.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.clavecentro, {
          x: 115,
          y: page1.getHeight() - 221.5,
          size: 7,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.telefonocentro, {
          x: 337,
          y: page1.getHeight() - 220.5,
          size: 6,
          font: helveticaFont,
          color: rgb(0, 0, 0.5),
        });
      }

      if (this.opcionesImprimir[1] == true) {
        // Desempeño laboral
        page1.drawText(registro.puntajeComp[0].toString(), {
          x: 495,
          y: page1.getHeight() - 475,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[1].toString(), {
          x: 495,
          y: page1.getHeight() - 491,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[2].toString(), {
          x: 495,
          y: page1.getHeight() - 509,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[3].toString(), {
          x: 495,
          y: page1.getHeight() - 528,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[4].toString(), {
          x: 495,
          y: page1.getHeight() - 546,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[5].toString(), {
          x: 495,
          y: page1.getHeight() - 561,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[6].toString(), {
          x: 495,
          y: page1.getHeight() - 577,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[7].toString(), {
          x: 495,
          y: page1.getHeight() - 593,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[8].toString(), {
          x: 495,
          y: page1.getHeight() - 609,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.puntajeComp[9].toString(), {
          x: 495,
          y: page1.getHeight() - 631,
          size: 7,
          font: helveticaFontBold,
          color: rgb(0, 0, 0.5),
        });

        page1.drawText(registro.sumaPuntaje.toString(), {
          x: 495,
          y: page1.getHeight() - 652,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });

        page1.drawText(registro.desempeno.toString(), {
          x: 350,
          y: page1.getHeight() - 673,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });

        page1.drawText(registro.dias.toString(), {
          x: 380,
          y: page1.getHeight() - 703,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });

        page1.drawText(registro.multiPuntajeyDias.toString(), {
          x: 379,
          y: page1.getHeight() - 735,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });
      }

      //INICIO IMPRESION DE DATOS ANTIGUEDAD
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[0].toString(), {
        x: 140,
        y: page1.getHeight() - 270,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[1].toString(), {
        x: 140,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[2].toString(), {
        x: 140,
        y: page1.getHeight() - 289,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[3].toString(), {
        x: 140,
        y: page1.getHeight() - 296.4,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[4].toString(), {
        x: 140,
        y: page1.getHeight() - 306,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[5].toString(), {
        x: 140,
        y: page1.getHeight() - 317,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[6].toString(), {
        x: 140,
        y: page1.getHeight() - 324.3,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[7].toString(), {
        x: 140,
        y: page1.getHeight() - 331.7,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[8].toString(), {
        x: 140,
        y: page1.getHeight() - 340.3,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[9].toString(), {
        x: 140,
        y: page1.getHeight() - 349,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[10].toString(), {
        x: 140,
        y: page1.getHeight() - 359.6,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[11].toString(), {
        x: 140,
        y: page1.getHeight() - 369.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[12].toString(), {
        x: 140,
        y: page1.getHeight() - 376.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[13].toString(), {
        x: 140,
        y: page1.getHeight() - 383.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[14].toString(), {
        x: 261.5,
        y: page1.getHeight() - 270,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[15].toString(), {
        x: 261.5,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[16].toString(), {
        x: 261.5,
        y: page1.getHeight() - 289,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[17].toString(), {
        x: 261.5,
        y: page1.getHeight() - 296.4,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[18].toString(), {
        x: 261.5,
        y: page1.getHeight() - 306,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[19].toString(), {
        x: 261.5,
        y: page1.getHeight() - 317,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[20].toString(), {
        x: 261.5,
        y: page1.getHeight() - 324.3,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[21].toString(), {
        x: 261.5,
        y: page1.getHeight() - 331.7,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[22].toString(), {
        x: 261.5,
        y: page1.getHeight() - 340.3,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[23].toString(), {
        x: 261.5,
        y: page1.getHeight() - 349,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[24].toString(), {
        x: 261.5,
        y: page1.getHeight() - 359.6,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[25].toString(), {
        x: 261.5,
        y: page1.getHeight() - 369.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[26].toString(), {
        x: 261.5,
        y: page1.getHeight() - 376.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.antiguedad_Backend.valoresAntiguedad[27].toString(), {
        x: 261.5,
        y: page1.getHeight() - 383.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      //FINAL IMPRESION DE DATOS ANTIGUEDAD

      //INICIO IMPRESION PREPARACION ACADEMICA
      page2.drawText(this.preparacionacademica_Backend.primaria[0].toString(), {
        x: 356.5,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[1].toString(), {
        x: 383.5,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[2].toString(), {
        x: 408.5,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[3].toString(), {
        x: 431,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[4].toString(), {
        x: 450,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[5].toString(), {
        x: 471,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.primaria[5].toString(), {
        x: 513,
        y: page1.getHeight() - 280.5,
        size: 5,
        font: helveticaFontBold,
        color: rgb(0, 0, 0),
      });
      page2.drawText(
        this.preparacionacademica_Backend.secundaria[0].toString(),
        {
          x: 356.5,
          y: page1.getHeight() - 289,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.secundaria[1].toString(),
        {
          x: 383.5,
          y: page1.getHeight() - 289,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.secundaria[2].toString(),
        {
          x: 408.5,
          y: page1.getHeight() - 289,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.secundaria[2].toString(),
        {
          x: 513,
          y: page1.getHeight() - 289,
          size: 5,
          font: helveticaFontBold,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(this.preparacionacademica_Backend.carreraC[0].toString(), {
        x: 356.5,
        y: page1.getHeight() - 313.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.carreraC[1].toString(), {
        x: 383.5,
        y: page1.getHeight() - 313.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.carreraC[2].toString(), {
        x: 408.5,
        y: page1.getHeight() - 313.5,
        size: 5,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      page2.drawText(this.preparacionacademica_Backend.carreraC[2].toString(), {
        x: 513,
        y: page1.getHeight() - 313.5,
        size: 5,
        font: helveticaFontBold,
        color: rgb(0, 0, 0),
      });
      page2.drawText(
        this.preparacionacademica_Backend.licenciatura[0].toString(),
        {
          x: 356.5,
          y: page1.getHeight() - 331.7,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.licenciatura[1].toString(),
        {
          x: 383.5,
          y: page1.getHeight() - 331.7,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.licenciatura[2].toString(),
        {
          x: 408.5,
          y: page1.getHeight() - 331.7,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.licenciatura[3].toString(),
        {
          x: 431,
          y: page1.getHeight() - 331.7,
          size: 5,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.preparacionacademica_Backend.licenciatura[3].toString(),
        {
          x: 513,
          y: page1.getHeight() - 331.7,
          size: 5,
          font: helveticaFontBold,
          color: rgb(0, 0, 0),
        }
      );
      page2.drawText(
        this.sumaPreparacionA.toString(),
        {
          x: 512.5,
          y: page1.getHeight() - 340.5,
          size: 5,
          font: helveticaFontBold,
          color: rgb(0, 0, 0),
        }
      );

      //FINAL IMPRESION PREPARACION ACADEMICA
      if (this.opcionesImprimir[2] == true) {
        // antiguedad
        page2.drawText(registro.antiguedad.toString(), {
          x: 267,
          y: page1.getHeight() - 394,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });
      }

      if (this.opcionesImprimir[3] == true) {
        // Preparación academica
        page2.drawText(registro.academico.toString(), {
          x: 433,
          y: page1.getHeight() - 356,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });
      }

      if (this.opcionesImprimir[4] == true) {
        // Cursos
        page2.drawText(registro.cursos.toString(), {
          x: 462,
          y: page1.getHeight() - 417,
          size: 7,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });

        page2.drawText(registro.resultadototal.toString(), {
          x: 329,
          y: page1.getHeight() - 448.5,
          size: 9,
          font: helveticaFontBold,
          color: rgb(1, 0, 0),
        });

        const chunkSize = 100;
let yy = page1.getHeight() - 550 ; // Valor inicial de y

let remainingText = registro.observaciones.replace(/\n/g, ' ');
while (remainingText.length > 0) {
let chunk = remainingText.substring(0, chunkSize);

if (chunk.length >= chunkSize) {
const lastSpaceIndex = chunk.lastIndexOf(' ');
if (lastSpaceIndex !== -1) {
  chunk = chunk.substring(0, lastSpaceIndex);
}
}

if (chunk.charAt(0) === ' ') {
chunk = chunk.substring(1);
}

page2.drawText(chunk, {
x: 124,
y: yy,
size: 7,
font: helveticaFont,
color: rgb(0, 0, 0.5),
});

remainingText = remainingText.substring(chunk.length).trim();
  yy -= 9.5; // Disminuye el valor de y en 9.5 puntos
}
      }

      const modifiedPdfBytes = await pdfDoc.save();

      // Descargar el archivo PDF para el registro actual
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FCAPS-3_${registro.nombrepersonal}.pdf`;
      link.click();
    }
  }
}
