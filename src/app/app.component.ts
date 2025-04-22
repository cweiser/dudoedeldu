import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef;

  doc = new Y.Doc();
  provider!: WebrtcProvider;
  yText!: Y.Text;
  sharedTextContent: string = '';
  roomName: string = '';

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    this.roomName = params.get('room') || 'p2p-shared-text-room';
    this.connectToRoom(this.roomName);
  }

  ngAfterViewInit() {
    this.generateQRCode(this.roomName);
  }

  async connectToRoom(room: string) {
    this.provider = new WebrtcProvider(room, this.doc);
    this.yText = this.doc.getText('shared-text');
    this.sharedTextContent = this.yText.toString();

    this.yText.observe(() => {
      const updated = this.yText.toString();
      if (updated !== this.sharedTextContent) {
        this.sharedTextContent = updated;
      }
    });

    this.generateQRCode(room);
  }

  reconnectToRoom() {
    this.provider.destroy();
    this.doc = new Y.Doc();
    this.connectToRoom(this.roomName);
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(this.roomName)}`;
    window.history.replaceState({}, '', newUrl);
  }

  updateSharedText() {
    if (this.sharedTextContent !== this.yText.toString()) {
      this.yText.delete(0, this.yText.length);
      this.yText.insert(0, this.sharedTextContent);
    }
  }

  async generateQRCode(room: string) {
    const canvas = this.qrCanvas?.nativeElement;
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    if (canvas) {
      await QRCode.toCanvas(canvas, url);
    }
  }
}
