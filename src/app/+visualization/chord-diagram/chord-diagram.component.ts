import { isPlatformServer } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import * as d3 from 'd3';
import { PieArcDatum } from 'd3-shape';

import { v4 as uuidv4 } from 'uuid';

import { DataNetwork, DirectedData } from '../../core/store/sdr/sdr.reducer';

@Component({
  selector: 'scholars-chord-diagram',
  templateUrl: './chord-diagram.component.html',
  styleUrls: ['./chord-diagram.component.scss'],
})
export class ChordDiagramComponent implements OnInit {

  @Input() dataNetwork: DataNetwork;

  @Input() sourceTooltipKey = 'VISUALIZATION.NETWORK.COAUTHOR.TOOLTIP.SOURCE';
  @Input() targetTooltipKey = 'VISUALIZATION.NETWORK.COAUTHOR.TOOLTIP.TARGET';
  @Input() ribbonTooltipKey = 'VISUALIZATION.NETWORK.COAUTHOR.TOOLTIP.RIBBON';

  @Input() height = 1024;
  @Input() width = 1024;

  @Input() outerPadding = 0;
  @Input() shellWidth = 16;
  @Input() shellGap = 2;

  @Input() defaultOpacity = .75;
  @Input() hoverOpacity = .15;

  @Input() fontFamily = 'sans-serif';

  @Input() labelFontSize = 14;

  public id = uuidv4();

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    if (isPlatformServer(this.platformId) || this.dataNetwork === undefined) {
      return;
    }

    setTimeout(() => {
      const { data, lookup } = this.dataNetwork;

      if (data.length === 0) {
        return;
      }

      const ids: string[] = Array.from(new Set(data.flatMap(d => [d.source, d.target])));

      const matrix = this.build(data, ids);

      const labelLength = Math.max(...(ids.map(n => lookup[n].length))) * this.labelFontSize / 1.5;

      const innerRadius = Math.min(this.width, this.height) * .5 - (labelLength + this.outerPadding);
      const outerRadius = innerRadius + this.shellWidth;

      const color = (i: number) => d3.scaleOrdinal(ids, d3.schemeCategory10)(ids[i]);

      const ribbon = d3.ribbonArrow()
        .radius(innerRadius - this.shellGap)
        .padAngle(1 / innerRadius);

      const arc = d3.arc<PieArcDatum<DirectedData>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      const chord = (a) =>
        d3.chordDirected()
          .padAngle(6 / innerRadius)
          .sortSubgroups(d3.descending)
          .sortChords(d3.descending)(a);

      const chords = chord(matrix);

      const fade = (opacity: number) => (p: SVGPathElement, cg: d3.ChordGroup) => {
        ribbons
          .filter(dd => dd.source.index !== cg.index && dd.target.index !== cg.index)
          .transition()
          .style('opacity', opacity);
        groupPath
          .filter(dd => matrix[cg.index][dd.index] === 0 && matrix[dd.index][cg.index] === 0 && dd.index !== cg.index)
          .transition()
          .style('opacity', opacity);
      };

      const mouseOverIndividual = (e: SVGPathElement, d: d3.ChordGroup) => {
        fade(this.hoverOpacity)(e, d);

        tooltip.transition()
          .style('opacity', 1);

        const name = lookup[ids[d.index]];
        if (ids[d.index] === this.dataNetwork.id) {
          const count = Object.keys(this.dataNetwork.linkCounts).length;
          tooltip.html(this.translate.instant(this.sourceTooltipKey, {
            name,
            count
          }));
        } else {
          const count = this.dataNetwork.linkCounts[ids[d.index]];
          tooltip.html(this.translate.instant(this.targetTooltipKey, {
            name,
            count
          }));
        }
      };

      const mouseOutIndividual = (e: SVGPathElement, d: d3.ChordGroup) => {
        fade(this.defaultOpacity)(e, d);

        tooltip.transition()
          .style('opacity', 0);
      };

      const clickIndividual = (e: SVGPathElement, d: d3.ChordGroup) => {
        this.router.navigate(['/display', ids[d.index]]);
      };

      const figure = d3.select('figure');

      const tooltip = figure
        .append('div')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('padding', '10px');

      const positionTooltip = event => tooltip.style('top', `${event.pageY + 15}px`).style('left', `${event.pageX + 15}px`);

      const svg = figure
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height]);

      const group = svg.append('g')
        .attr('font-family', this.fontFamily)
        .attr('font-size', this.labelFontSize)
        .selectAll('g')
        .data(chords.groups)
        .enter()
        .append('g');

      group.append('text')
        .each(d => { d.value = (d.startAngle + d.endAngle) / 2; })
        .attr('dy', '.35em')
        .attr('transform', d => `rotate(${(d.value * 180 / Math.PI - 90)}) translate(${innerRadius + 26}) ${d.value > Math.PI ? 'rotate(180)' : ''}`)
        .attr('text-anchor', d => d.value > Math.PI ? 'end' : null)
        .attr('font-weight', d => ids[d.index] === this.dataNetwork.id ? 'bold' : 'normal')
        .style("cursor", "pointer")
        .text(d => lookup[ids[d.index]])
        .on('mouseover', mouseOverIndividual)
        .on('mousemove', positionTooltip)
        .on('mouseout', mouseOutIndividual)
        .on('click', clickIndividual);

      const groupPath = group
        .join('g')
        .call(g => g.append('path')
          .attr('d', arc)
          .attr('fill', d => ids[d.index] === this.dataNetwork.id ? 'black' : color(d.index))
          .attr('stroke', '#fff')
          .on('mouseover', mouseOverIndividual)
          .on('mousemove', positionTooltip)
          .on('mouseout', mouseOutIndividual));

      const ribbons = svg.append('g')
        .attr('fill-opacity', this.defaultOpacity)
        .selectAll('g')
        .data(chords)
        .join('path')
        .attr('d', <any>ribbon)
        .attr('fill', d => color(d.source.index))
        .on('mouseover', (e, d) => {
          ribbons
            .filter(dd => dd !== d)
            .transition()
            .style('opacity', this.hoverOpacity);
          groupPath
            .filter((dd) => dd.index !== d.source.index && dd.index !== d.target.index)
            .transition()
            .style('opacity', this.hoverOpacity);

          tooltip.transition()
            .style('opacity', 1);

          tooltip.html(this.translate.instant(this.ribbonTooltipKey, {
            source: lookup[ids[d.source.index]],
            target: lookup[ids[d.target.index]],
            value: d.target.value
          }));
        })
        .on('mousemove', positionTooltip)
        .on('mouseout', () => {
          ribbons
            .transition()
            .style('opacity', this.defaultOpacity);
          groupPath
            .transition()
            .style('opacity', this.defaultOpacity);

          tooltip.transition()
            .style('opacity', 0);
        });

    });
  }

  private build = (data: DirectedData[], ids: string[]) => {
    const index = new Map<string, number>(ids.map((id, i) => [id, i]));
    const matrix: number[][] = Array.from(index, () => new Array(ids.length).fill(0));
    for (const { source, target, count } of data) {
      matrix[index.get(source)][index.get(target)] += count;
    }

    return matrix;
  }

}
