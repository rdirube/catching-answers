import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { AppInfoOxService, BaseMicroLessonApp, EndGameService, GameActionsService, InWumboxService, LevelService, MicroLessonCommunicationService, MicroLessonMetricsService, ProgressService, ResourceStateService, SoundOxService } from 'micro-lesson-core';
import { PostMessageBridgeFactory } from 'ngox-post-message';
import { CommunicationOxService, I18nService, PreloaderOxService, ResourceOx, ResourceType } from 'ox-core';
import { CatchingAnswersChallengeService } from './shared/services/catching-answers-challenge.service';
import { environment } from 'src/environments/environment';
import { ResourceFinalStateOxBridge, ScreenTypeOx } from 'ox-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent extends BaseMicroLessonApp {


  protected getBasePath(): string {
    return environment.basePath;
  }


  

 

  constructor(preloader: PreloaderOxService, translocoService: TranslocoService, wumboxService: InWumboxService,
    communicationOxService: CommunicationOxService, microLessonCommunicationService: MicroLessonCommunicationService<any>,
    progressService: ProgressService, elementRef: ElementRef, private _gameActionsService: GameActionsService<any>,
    endGame: EndGameService, i18nService: I18nService, levelService: LevelService, http: HttpClient,
    private _challengeService: CatchingAnswersChallengeService, private _appInfoService: AppInfoOxService,
    private _metrics: MicroLessonMetricsService<any>, // Todo
    resourceStateService: ResourceStateService,
    sound: SoundOxService, bridgeFactory: PostMessageBridgeFactory,
    transloco: TranslocoService) {
    super(preloader, translocoService, wumboxService, communicationOxService, microLessonCommunicationService,
      progressService, elementRef, _gameActionsService, endGame,
      i18nService, levelService, http, _challengeService, _appInfoService, _metrics, sound, bridgeFactory);
      
      communicationOxService.receiveI18NInfo.subscribe(z => {
        console.log('i18n', z);
      });
      this._gameActionsService.microLessonCompleted.subscribe(__ => {
        if (resourceStateService.currentState?.value) {
          microLessonCommunicationService.sendMessageMLToManager(ResourceFinalStateOxBridge, resourceStateService.currentState.value);
        }
      });

      preloader.addResourcesToLoad(this.getGameResourcesToLoad());
      console.log('App component instanciated', this);
      this.sound.setSoundOn(true);  
      preloader.loadAll().subscribe(x => this.loaded = true)

}



protected getGameResourcesToLoad(): ResourceOx[] {
  const svgElements: string[] = ['Boton-congelar.svg', 'Boton-copa.svg', 'Boton-correcto.svg', 'Boton-incorrecto.svg', 'Boton-descongelar.svg', 
  'Boton-flecha.svg', 'Boton-home.svg', 'Boton-pista.svg','Boton-rendirse.svg', 'Boton-sonido-submarino', 'burbuja.svg', 'burbuja-correcto.svg',
'burbuja-incorrecto', 'burbuja-seleccion', 'fondo.svg', 'submarino.svg'];

return svgElements.map(x => new ResourceOx('mini-lessons/executive-functions/catching-answers/game/svg/' + x, ResourceType.Svg,
[ScreenTypeOx.Game], true))

}



title = 'catching-answers';


}