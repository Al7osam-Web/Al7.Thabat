import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaceableComponentsService } from '@abp/ng.core';
import { eAccountComponents } from '@abp/ng.account';
import { eThemeLeptonXComponents } from '@abp/ng.theme.lepton-x';
import { LogoComponent } from './logo/logo.component';
import { AccountLayoutComponent } from './theme-replacement/components/account-layout/account-layout.component';
import { LoginComponent } from './theme-replacement/components/login/login.component';

@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <abp-loader-bar></abp-loader-bar>
    <abp-dynamic-layout></abp-dynamic-layout>
  `,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer?: MutationObserver;

  constructor(private replaceableComponents: ReplaceableComponentsService) {}

  ngOnInit() {
    this.replaceableComponents.add({
      component: LogoComponent,
      key: eThemeLeptonXComponents.Logo,
    });

    this.replaceableComponents.add({
      component: AccountLayoutComponent,
      key: eThemeLeptonXComponents.AccountLayout,
    });

    this.replaceableComponents.add({
      component: LoginComponent,
      key: eAccountComponents.Login,
    });
  }

  ngAfterViewInit(): void {
    const isInsideEditable = (node: Node | null): boolean => {
      let el: HTMLElement | null =
        node && (node.nodeType === 1 ? (node as HTMLElement) : (node.parentElement as HTMLElement));

      while (el) {
        if (
          el.isContentEditable ||
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'P-EDITOR' ||
          el.classList?.contains('p-editor') ||
          el.classList?.contains('p-editor-container') ||
          el.classList?.contains('p-editor-content') ||
          el.classList?.contains('ql-container') ||
          el.classList?.contains('ql-editor') ||
          el.classList?.contains('ql-tooltip')
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const replaceInSubtree = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node: Node) => {
          if (isInsideEditable(node)) return NodeFilter.FILTER_REJECT;
          return /\u00A0/.test((node as Text).data ?? '')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      } as any);

      const toUpdate: Text[] = [];
      while (walker.nextNode()) toUpdate.push(walker.currentNode as Text);

      for (const t of toUpdate) {
        t.data = t.data.replace(/\u00A0/g, ' ');
      }
    };

    replaceInSubtree(document.body);

    this.observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const n of Array.from(m.addedNodes)) {
            if (isInsideEditable(n)) continue;
            replaceInSubtree(n);
          }
        } else if (m.type === 'characterData') {
          const t = m.target as Text;
          if (!isInsideEditable(t) && /\u00A0/.test(t.data)) {
            t.data = t.data.replace(/\u00A0/g, ' ');
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
