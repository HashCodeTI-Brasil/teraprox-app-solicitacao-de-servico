/**
 * MatchingObject — describes a real-time subscription to a context/location pair.
 */
export class MatchingObject {
  /**
   * @param {string} context - e.g. 'solicitacaoDeServico'
   * @param {string} location - e.g. '*' (wildcard) or specific ID
   * @param {function} refresher - callback when new data arrives
   * @param {boolean} persist - if true, survives context changes
   */
  constructor(context, location, refresher, persist = false) {
    this.context = context;
    this.location = location;
    this.refresher = refresher;
    this.persist = persist;
  }
}
