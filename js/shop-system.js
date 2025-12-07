// ===== 크리스마스 상점 시스템 =====

let shopConfig = null;
let userInventory = [];

// 상점 설정 로드
async function loadShopConfig() {
    try {
        const response = await fetch('./json/shop-config.json')  // 경로 수정
        shopConfig = await response.json();
        console.log("✅ 상점 설정 로드 완료:", shopConfig.items.length + "개 아이템");
        
        // 신규 유저 환영 보너스
        checkWelcomeBonus();
    } catch(err) {
        console.error("❌ 상점 설정 로드 실패:", err);
        shopConfig = { categories: [], items: [], shopSettings: {} };
    }
}

// 신규 유저 환영 보너스
async function checkWelcomeBonus() {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    const snapshot = await db.ref("users/" + uid + "/receivedWelcomeBonus").once("value");
    
    if(!snapshot.exists() && shopConfig.shopSettings.welcomeBonus) {
        await updateUserMoney(shopConfig.shopSettings.welcomeBonus, "신규 가입 환영 보너스");
        await db.ref("users/" + uid + "/receivedWelcomeBonus").set(true);
        
        alert(shopConfig.shopSettings.welcomeMessage || "환영합니다!");
    }
}

// 상점 페이지 표시
window.showShop = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    const section = document.getElementById("shopSection");
    if(!section) {
        console.error("❌ shopSection 요소를 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    updateURL('shop');
    
    // 유저 인벤토리 로드
    await loadUserInventory();
    
    // 현재 보유 금액
    const currentMoney = await getUserMoney();
    
    const content = document.getElementById("shopContent");
    if(!content) return;
    
    showLoadingIndicator("상점 로딩 중...");
    
    // 카테고리별 아이템 분류
    const itemsByCategory = {};
    shopConfig.categories.forEach(cat => {
        itemsByCategory[cat.id] = shopConfig.items.filter(item => item.category === cat.id);
    });
    
    hideLoadingIndicator();
    
    content.innerHTML = `
        <div style="max-width:1200px; margin:0 auto; padding:20px;">
            <!-- 헤더 -->
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="font-size:36px; margin-bottom:10px;">🎄 크리스마스 상점</h1>
                <p style="color:#5f6368; font-size:16px;">특별한 크리스마스 아이템으로 프로필을 꾸며보세요!</p>
            </div>
            
            <!-- 보유 금액 -->
            <div style="background:linear-gradient(135deg, #d4af37 0%, #ffd700 100%); padding:20px; border-radius:12px; text-align:center; margin-bottom:30px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                <div style="font-size:14px; color:#000; opacity:0.8; margin-bottom:5px;">💰 보유 포인트</div>
                <div style="font-size:42px; font-weight:900; color:#000;">${currentMoney.toLocaleString()}원</div>
            </div>
            
            <!-- 추천 아이템 -->
            ${renderFeaturedItems(shopConfig.items.filter(item => item.featured), currentMoney)}
            <!-- 카테고리별 아이템 -->
            ${shopConfig.categories.map(category => `
                <div style="margin-bottom:40px;">
                    <h2 style="font-size:24px; margin-bottom:20px; color:#c62828;">
                        ${category.name}
                    </h2>
                    <p style="color:#5f6368; margin-bottom:20px;">${category.description}</p>
                    
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                        ${itemsByCategory[category.id].map(item => renderShopItem(item, currentMoney)).join('')}
                    </div>
                </div>
            `).join('')}
            
            <!-- 내 아이템 보기 -->
            <div style="text-align:center; margin-top:40px;">
                <button onclick="showInventory()" class="btn-secondary" style="padding:15px 40px; font-size:16px;">
                    <i class="fas fa-box-open"></i> 내 아이템 보기
                </button>
            </div>
        </div>
    `;
}

// 추천 아이템 렌더링
function renderFeaturedItems(items, userMoney) {
    if(items.length === 0) return '';
    
    return `
        <div style="margin-bottom:40px;">
            <h2 style="font-size:28px; margin-bottom:20px; color:#c62828; text-align:center;">
                ⭐ 추천 아이템
            </h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                ${items.map(item => renderShopItem(item, userMoney, true)).join('')}
            </div>
        </div>
    `;
}

// 상점 아이템 카드 렌더링
function renderShopItem(item, userMoney, isFeatured = false) {
    const owned = userInventory.includes(item.unlocks);
    const canAfford = userMoney >= item.price;
    const isBundle = item.isBundle || false;
    
    // 필수 아이템 체크
    let canBuy = true;
    let requiredMessage = '';
    if(item.requiredItem) {
        const requiredItemData = shopConfig.items.find(i => i.id === item.requiredItem);
        const hasRequired = userInventory.includes(requiredItemData.unlocks);
        if(!hasRequired) {
            canBuy = false;
            requiredMessage = `<div style="color:#f44336; font-size:12px; margin-top:5px;">⚠️ ${requiredItemData.name} 필요</div>`;
        }
    }
    
    return `
        <div class="shop-item-card ${isFeatured ? 'featured' : ''}" style="
            background:white;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 12px rgba(0,0,0,0.1);
            transition:all 0.3s ease;
            border:${isFeatured ? '3px solid #d4af37' : '1px solid #e0e0e0'};
            ${owned ? 'opacity:0.7;' : ''}
        ">
            <!-- 뱃지 -->
            ${isFeatured ? '<div style="background:#d4af37; color:#000; padding:5px 10px; font-size:11px; font-weight:900; text-align:center;">⭐ 추천</div>' : ''}
            ${isBundle ? '<div style="background:#c62828; color:white; padding:5px 10px; font-size:11px; font-weight:900; text-align:center;">🎁 번들 (30% 할인)</div>' : ''}
            ${owned ? '<div style="background:#4caf50; color:white; padding:5px 10px; font-size:11px; font-weight:900; text-align:center;">✅ 보유중</div>' : ''}
            
            <!-- 이미지 -->
            <div style="width:100%; height:180px; background:#f1f3f4; display:flex; align-items:center; justify-content:center; font-size:80px;">
                ${item.icon}
            </div>
            
            <!-- 정보 -->
            <div style="padding:20px;">
                <h3 style="font-size:18px; margin-bottom:10px; color:#212529;">${item.name}</h3>
                <p style="color:#5f6368; font-size:14px; line-height:1.6; margin-bottom:15px; min-height:60px;">${item.description}</p>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="font-size:24px; font-weight:900; color:#c62828;">
                        ${item.price.toLocaleString()}원
                    </div>
                    ${item.maxPurchases === 1 ? '<span style="font-size:12px; color:#868e96;">1회 구매</span>' : ''}
                </div>
                
                ${requiredMessage}
                
                ${owned ? 
                    '<button class="btn-secondary btn-block" disabled style="opacity:0.5;">이미 보유중</button>' :
                    canBuy && canAfford ?
                        `<button onclick="purchaseItem('${item.id}')" class="btn-primary btn-block">
                            <i class="fas fa-shopping-cart"></i> 구매하기
                        </button>` :
                        `<button class="btn-secondary btn-block" disabled style="opacity:0.5;">
                            ${!canBuy ? '필수 아이템 필요' : '포인트 부족'}
                        </button>`
                }
            </div>
        </div>
    `;
}

// 유저 인벤토리 로드
async function loadUserInventory() {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    const snapshot = await db.ref("users/" + uid + "/inventory").once("value");
    userInventory = snapshot.val() || [];
}

// 상품 구매 함수 수정 (shop-system.js 내부)
window.purchaseItem = async function(itemId) {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    // [수정 1] shopItems 변수 오류 수정 -> shopConfig.items 사용
    if (!shopConfig || !shopConfig.items) {
        alert("상점 데이터를 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    const item = shopConfig.items.find(i => i.id === itemId);
    if(!item) return;
    
    const uid = getUserId();
    
    try {
        // 현재 보유 포인트 확인
        // [수정 2] 문자열 비교 오류 방지를 위해 Number()로 강제 형변환
        let currentMoney = await getUserMoney();
        currentMoney = Number(currentMoney); 
        const itemPrice = Number(item.price);
        
        console.log("💰 구매 시도:", {
            상품: item.name,
            가격: itemPrice,
            보유포인트: currentMoney
        });
        
        // 포인트 부족 체크
        // [수정 3] 형변환된 숫자로 비교하여 정확도 보장
        if(currentMoney < itemPrice) {
            alert(`💸 포인트가 부족합니다!\n\n필요: ${itemPrice.toLocaleString()}원\n보유: ${currentMoney.toLocaleString()}원`);
            return;
        }
        
        // 이미 구매했는지 확인
        const purchaseSnapshot = await db.ref("users/" + uid + "/purchases/" + itemId).once("value");
        if(purchaseSnapshot.exists()) {
            alert("이미 구매한 상품입니다!");
            return;
        }
        
        // 확인 메시지
        if(!confirm(`🛒 구매하시겠습니까?\n\n상품: ${item.name}\n가격: ${itemPrice}원\n보유: ${currentMoney}원`)) {
            return;
        }
        
        // 포인트 차감
        await updateUserMoney(-itemPrice, `상점 구매: ${item.name}`);
        
        // 구매 기록
        await db.ref("users/" + uid + "/purchases/" + itemId).set({
            itemId: itemId,
            itemName: item.name,
            price: itemPrice,
            purchasedAt: Date.now()
        });
        
        // 인벤토리에 아이템 추가
        const inventorySnapshot = await db.ref("users/" + uid + "/inventory").once("value");
        let inventory = inventorySnapshot.val() || [];
        
        // 패키지 상품 처리
        if(item.includes && item.includes.length > 0) {
            // 패키지에 포함된 모든 아이템 추가
            item.includes.forEach(includedItem => {
                if(!inventory.includes(includedItem)) {
                    inventory.push(includedItem);
                }
            });
        } else {
            // 단일 아이템 추가
            if(!inventory.includes(itemId)) {
                inventory.push(itemId);
            }
        }
        
        await db.ref("users/" + uid + "/inventory").set(inventory);
        
        alert(`✅ 구매 완료!\n\n${item.name}을(를) 구매했습니다.`);
        
        // 상점 새로고침
        showShop();
        
    } catch(error) {
        console.error("❌ 구매 오류:", error);
        alert("구매 중 오류가 발생했습니다: " + error.message);
    }
}

// 인벤토리 페이지 표시 (전체 페이지)
window.showInventoryPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    const section = document.getElementById("inventorySection");
    if(!section) {
        console.error("❌ inventorySection 요소를 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    updateURL('inventory');
    
    await loadUserInventory();
    
    const content = document.getElementById("inventoryContent");
    if(!content) return;
    
    showLoadingIndicator("인벤토리 로딩 중...");
    
    // 활성화된 장식 로드
    const uid = getUserId();
    const decorSnapshot = await db.ref("users/" + uid + "/activeDecorations").once("value");
    const activeDecorations = decorSnapshot.val() || [];
    
    // 카테고리별 분류
    const ownedItems = shopConfig.items.filter(item => 
        userInventory.includes(item.unlocks) && !item.isBundle
    );
    
    const itemsByCategory = {
        themes: ownedItems.filter(i => i.category === 'themes'),
        sounds: ownedItems.filter(i => i.category === 'sounds'),
        decorations: ownedItems.filter(i => i.category === 'decorations')
    };
    
    // 구매 이력 로드
    const purchaseSnapshot = await db.ref("users/" + uid + "/purchaseHistory").once("value");
    const purchaseHistory = [];
    purchaseSnapshot.forEach(child => {
        purchaseHistory.unshift({id: child.key, ...child.val()});
    });
    
    hideLoadingIndicator();
    
    content.innerHTML = `
        <div style="max-width:1200px; margin:0 auto; padding:20px;">
            <!-- 헤더 -->
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="font-size:36px; margin-bottom:10px;">🎁 내 인벤토리</h1>
                <p style="color:#5f6368; font-size:16px;">보유한 아이템을 관리하고 적용할 수 있습니다</p>
            </div>
            
            <!-- 통계 카드 -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:40px;">
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size:14px; opacity:0.9; margin-bottom:5px;">📦 보유 아이템</div>
                    <div style="font-size:36px; font-weight:900;">${ownedItems.length}개</div>
                </div>
                
                <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color:white; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size:14px; opacity:0.9; margin-bottom:5px;">✨ 적용중인 장식</div>
                    <div style="font-size:36px; font-weight:900;">${activeDecorations.length}개</div>
                </div>
                
                <div style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color:white; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size:14px; opacity:0.9; margin-bottom:5px;">🛍️ 총 구매 횟수</div>
                    <div style="font-size:36px; font-weight:900;">${purchaseHistory.length}회</div>
                </div>
            </div>
            
            <!-- 탭 메뉴 -->
            <div class="tab-buttons" style="margin-bottom:30px;">
                <button onclick="switchInventoryTab('items')" class="tab-btn active" id="itemsTabBtn">
                    📦 내 아이템
                </button>
                <button onclick="switchInventoryTab('decorations')" class="tab-btn" id="decorationsTabBtn">
                    ✨ 장식 관리
                </button>
                <button onclick="switchInventoryTab('history')" class="tab-btn" id="historyTabBtn">
                    📜 구매 이력
                </button>
            </div>
            
            <!-- 내 아이템 탭 -->
            <div id="itemsTab" style="display:block;">
                ${ownedItems.length === 0 ? `
                    <div style="text-align:center; padding:80px 20px; background:white; border-radius:12px;">
                        <div style="font-size:80px; margin-bottom:20px;">📦</div>
                        <h3 style="color:#212529; margin-bottom:10px;">보유한 아이템이 없습니다</h3>
                        <p style="color:#5f6368; margin-bottom:30px;">상점에서 크리스마스 아이템을 구매해보세요!</p>
                        <button onclick="showShop()" class="btn-primary" style="padding:15px 40px;">
                            <i class="fas fa-shopping-bag"></i> 상점 가기
                        </button>
                    </div>
                ` : `
                    ${Object.entries(itemsByCategory).map(([category, items]) => {
                        if(items.length === 0) return '';
                        
                        const categoryNames = {
                            themes: '🎄 테마',
                            sounds: '🔊 사운드',
                            decorations: '✨ 장식'
                        };
                        
                        return `
                            <div style="margin-bottom:40px;">
                                <h2 style="font-size:24px; margin-bottom:20px; color:#c62828;">
                                    ${categoryNames[category]}
                                </h2>
                                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
                                    ${items.map(item => renderInventoryItem(item, activeDecorations)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                `}
            </div>
            
            <!-- 장식 관리 탭 -->
            <div id="decorationsTab" style="display:none;">
                ${renderDecorationManagement(itemsByCategory.decorations, activeDecorations)}
            </div>
            
            <!-- 구매 이력 탭 -->
            <div id="historyTab" style="display:none;">
                ${renderPurchaseHistory(purchaseHistory)}
            </div>
        </div>
    `;
}

// 인벤토리 아이템 렌더링
function renderInventoryItem(item, activeDecorations) {
    const isActive = activeDecorations.includes(item.unlocks);
    
    return `
        <div class="inventory-item-card" style="
            background:white;
            border:2px solid ${isActive ? '#4caf50' : '#e0e0e0'};
            border-radius:12px;
            padding:20px;
            text-align:center;
            transition:all 0.3s ease;
            position:relative;
        ">
            ${isActive ? '<div style="position:absolute; top:10px; right:10px; background:#4caf50; color:white; padding:4px 8px; border-radius:12px; font-size:10px; font-weight:900;">적용중</div>' : ''}
            
            <div style="font-size:64px; margin-bottom:15px;">${item.icon}</div>
            <h4 style="font-size:16px; margin-bottom:8px; color:#212529; font-weight:700;">${item.name}</h4>
            <p style="font-size:13px; color:#5f6368; margin-bottom:15px; line-height:1.4;">${item.description}</p>
            
            ${item.category === 'decorations' ? `
                <button onclick="toggleDecoration('${item.unlocks}')" class="btn-${isActive ? 'secondary' : 'primary'} btn-block" style="font-size:13px;">
                    <i class="fas fa-${isActive ? 'times' : 'check'}"></i> ${isActive ? '제거하기' : '적용하기'}
                </button>
            ` : item.category === 'themes' && item.unlocks === 'christmas_theme' ? `
                <button onclick="showSettings(); setTimeout(() => selectTheme('christmas'), 500);" class="btn-primary btn-block" style="font-size:13px;">
                    <i class="fas fa-palette"></i> 테마 적용
                </button>
            ` : `
                <div style="color:#4caf50; font-size:13px; font-weight:600; padding:10px; background:#f1f8f4; border-radius:6px;">
                    ✅ 보유중
                </div>
            `}
        </div>
    `;
}

// 장식 관리 탭 렌더링
function renderDecorationManagement(decorations, activeDecorations) {
    if(decorations.length === 0) {
        return `
            <div style="text-align:center; padding:80px 20px; background:white; border-radius:12px;">
                <div style="font-size:80px; margin-bottom:20px;">✨</div>
                <h3 style="color:#212529; margin-bottom:10px;">장식 아이템이 없습니다</h3>
                <p style="color:#5f6368; margin-bottom:30px;">상점에서 프로필 장식을 구매해보세요!</p>
                <button onclick="showShop()" class="btn-primary" style="padding:15px 40px;">
                    <i class="fas fa-shopping-bag"></i> 상점 가기
                </button>
            </div>
        `;
    }
    
    return `
        <div style="background:white; border-radius:12px; padding:30px; margin-bottom:30px;">
            <h3 style="margin-bottom:20px; color:#c62828;">🎨 현재 적용된 장식</h3>
            ${activeDecorations.length === 0 ? `
                <p style="color:#868e96; text-align:center; padding:40px;">적용된 장식이 없습니다</p>
            ` : `
                <div style="display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px;">
                    ${activeDecorations.map(decorId => {
                        const item = decorations.find(d => d.unlocks === decorId);
                        if(!item) return '';
                        return `
                            <div style="background:#f1f8f4; border:2px solid #4caf50; border-radius:8px; padding:12px 20px; display:flex; align-items:center; gap:10px;">
                                <span style="font-size:24px;">${item.icon}</span>
                                <span style="font-weight:600; color:#212529;">${item.name}</span>
                                <button onclick="toggleDecoration('${decorId}')" style="background:#f44336; color:white; border:none; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; margin-left:10px;">
                                    <i class="fas fa-times" style="font-size:12px;"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button onclick="removeAllDecorations()" class="btn-danger" style="width:100%;">
                    <i class="fas fa-trash"></i> 모든 장식 제거
                </button>
            `}
        </div>
        
        <div style="background:white; border-radius:12px; padding:30px;">
            <h3 style="margin-bottom:20px; color:#c62828;">📦 사용 가능한 장식</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:20px;">
                ${decorations.map(item => {
                    const isActive = activeDecorations.includes(item.unlocks);
                    return `
                        <div style="background:${isActive ? '#f1f8f4' : '#f8f9fa'}; border:2px solid ${isActive ? '#4caf50' : '#e0e0e0'}; border-radius:12px; padding:15px; text-align:center;">
                            <div style="font-size:48px; margin-bottom:10px;">${item.icon}</div>
                            <h4 style="font-size:14px; margin-bottom:8px; color:#212529;">${item.name}</h4>
                            <button onclick="toggleDecoration('${item.unlocks}')" class="btn-${isActive ? 'secondary' : 'primary'} btn-block" style="font-size:12px; padding:8px;">
                                ${isActive ? '제거' : '적용'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// 구매 이력 렌더링
function renderPurchaseHistory(history) {
    if(history.length === 0) {
        return `
            <div style="text-align:center; padding:80px 20px; background:white; border-radius:12px;">
                <div style="font-size:80px; margin-bottom:20px;">📜</div>
                <h3 style="color:#212529; margin-bottom:10px;">구매 이력이 없습니다</h3>
                <p style="color:#5f6368;">상점에서 첫 구매를 해보세요!</p>
            </div>
        `;
    }
    
    return `
        <div style="background:white; border-radius:12px; padding:30px;">
            <h3 style="margin-bottom:20px; color:#c62828;">📜 구매 이력 (최근 ${history.length}건)</h3>
            <div style="display:flex; flex-direction:column; gap:15px;">
                ${history.map(purchase => `
                    <div style="background:#f8f9fa; border-left:4px solid #c62828; border-radius:8px; padding:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="flex:1; min-width:200px;">
                            <h4 style="font-size:16px; margin-bottom:5px; color:#212529;">${purchase.itemName}</h4>
                            <p style="font-size:12px; color:#5f6368;">${new Date(purchase.purchasedAt).toLocaleString()}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:20px; font-weight:900; color:#c62828;">-${purchase.price.toLocaleString()}원</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 탭 전환
window.switchInventoryTab = function(tab) {
    // 탭 버튼 활성화
    ['itemsTabBtn', 'decorationsTabBtn', 'historyTabBtn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    document.getElementById(tab + 'TabBtn')?.classList.add('active');
    
    // 탭 컨텐츠 표시
    ['itemsTab', 'decorationsTab', 'historyTab'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    document.getElementById(tab + 'Tab').style.display = 'block';
}

// 장식 토글 (적용/제거) - UI 즉시 업데이트
window.toggleDecoration = async function(decorationId) {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    const snapshot = await db.ref("users/" + uid + "/activeDecorations").once("value");
    let activeDecorations = snapshot.val() || [];
    
    if(activeDecorations.includes(decorationId)) {
        activeDecorations = activeDecorations.filter(d => d !== decorationId);
        await db.ref("users/" + uid + "/activeDecorations").set(activeDecorations);
        showToastNotification("✅ 장식 제거", "장식이 제거되었습니다.", null);
    } else {
        activeDecorations.push(decorationId);
        await db.ref("users/" + uid + "/activeDecorations").set(activeDecorations);
        showToastNotification("✅ 장식 적용", "장식이 적용되었습니다!", null);
    }
    
    // 인벤토리 페이지 새로고침
    if(document.getElementById("inventorySection")?.classList.contains("active")) {
        showInventoryPage();
    }
    
    // 설정 페이지에 있으면 프로필 업데이트
    if(document.getElementById("settingsSection")?.classList.contains("active")) {
        updateSettings();
    }
    
    // 기사 목록에 있으면 새로고침
    if(document.getElementById("articlesSection")?.classList.contains("active")) {
        renderArticles();
    }
    
    // 기사 상세에 있으면 댓글 새로고침
    if(document.getElementById("articleDetailSection")?.classList.contains("active") && currentArticleId) {
        loadCommentsWithProfile(currentArticleId);
    }
}

// 모든 장식 제거
window.removeAllDecorations = async function() {
    if(!confirm("모든 장식을 제거하시겠습니까?")) return;
    
    const uid = getUserId();
    await db.ref("users/" + uid + "/activeDecorations").set([]);
    
    alert("✅ 모든 장식이 제거되었습니다!");
    showInventoryPage();
}

// 인벤토리 모달 (간단 버전)
window.showInventory = async function() {
    if(!isLoggedIn()) return;
    
    await loadUserInventory();
    
    const ownedItems = shopConfig.items.filter(item => 
        userInventory.includes(item.unlocks) && !item.isBundle
    );
    
    const modalHTML = `
        <div id="inventoryModal" class="modal active">
            <div class="modal-content" style="max-width:700px;">
                <div class="modal-header">
                    <h3 style="color:#c62828;">🎁 내 아이템</h3>
                    <button onclick="closeInventoryModal()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="padding:20px; text-align:center;">
                    <p style="color:#5f6368; margin-bottom:20px;">보유 아이템: ${ownedItems.length}개</p>
                    
                    <button onclick="closeInventoryModal(); showInventoryPage();" class="btn-primary btn-block" style="margin-bottom:10px;">
                        <i class="fas fa-box-open"></i> 인벤토리 전체보기
                    </button>
                    
                    <button onclick="closeInventoryModal(); showShop();" class="btn-secondary btn-block">
                        <i class="fas fa-shopping-bag"></i> 상점 가기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeInventoryModal = function() {
    const modal = document.getElementById("inventoryModal");
    if(modal) modal.remove();
}

// 장식 적용
window.applyDecoration = async function(decorationId) {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    
    // 현재 적용된 장식 로드
    const snapshot = await db.ref("users/" + uid + "/activeDecorations").once("value");
    let activeDecorations = snapshot.val() || [];
    
    // 이미 적용된 경우 제거, 아니면 추가
    if(activeDecorations.includes(decorationId)) {
        activeDecorations = activeDecorations.filter(d => d !== decorationId);
        await db.ref("users/" + uid + "/activeDecorations").set(activeDecorations);
        alert("✅ 장식이 제거되었습니다!");
    } else {
        activeDecorations.push(decorationId);
        await db.ref("users/" + uid + "/activeDecorations").set(activeDecorations);
        alert("✅ 장식이 적용되었습니다!");
    }
    
    // 모달 닫고 UI 업데이트
    closeInventoryModal();
    if(document.getElementById("settingsSection").classList.contains("active")) {
        updateSettings();
    }
}

// 프로필 사진에 장식 적용하여 HTML 생성
async function createProfilePhotoWithDecorations(photoUrl, size, email) {
    if(!email) return createProfilePhotoHTML(photoUrl, size);
    
    try {
        // 사용자 UID 찾기
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        let uid = null;
        
        for(const [key, userData] of Object.entries(usersData)) {
            if(userData.email === email) {
                uid = key;
                break;
            }
        }
        
        if(!uid) return createProfilePhotoHTML(photoUrl, size);
        
        // 활성화된 장식 로드
        const snapshot = await db.ref("users/" + uid + "/activeDecorations").once("value");
        const activeDecorations = snapshot.val() || [];
        
        if(activeDecorations.length === 0) {
            return createProfilePhotoHTML(photoUrl, size);
        }
        
        // 장식 효과 적용
        let decorationHTML = '';
        let borderStyle = '';
        let shadowEffect = '';
        
        // 🎅 산타 모자
        if(activeDecorations.includes('decoration_santa_hat')) {
            decorationHTML += `
                <div style="position:absolute; top:-${size/3}px; left:50%; transform:translateX(-50%) rotate(-10deg); z-index:10;">
                    <div style="position:relative;">
                        <!-- 모자 본체 -->
                        <div style="width:${size*0.8}px; height:${size*0.5}px; background:#c41e3a; border-radius:0 0 ${size/4}px ${size/4}px; position:relative; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
                            <!-- 흰색 테두리 -->
                            <div style="position:absolute; bottom:-3px; left:0; right:0; height:${size/10}px; background:white; border-radius:0 0 ${size/5}px ${size/5}px;"></div>
                        </div>
                        <!-- 모자 끝 폼폼 -->
                        <div style="position:absolute; top:-${size/8}px; right:${size/8}px; width:${size/5}px; height:${size/5}px; background:white; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.2);"></div>
                    </div>
                </div>
            `;
        }
        
        // 🦌 루돌프 뿔
        if(activeDecorations.includes('decoration_antlers')) {
            decorationHTML += `
                <div style="position:absolute; top:-${size/4}px; left:50%; transform:translateX(-50%); z-index:10; display:flex; gap:${size/2}px;">
                    <!-- 왼쪽 뿔 -->
                    <div style="position:relative; width:${size/5}px;">
                        <div style="width:4px; height:${size/3}px; background:#8b4513; position:absolute; left:0; transform:rotate(-20deg);"></div>
                        <div style="width:3px; height:${size/5}px; background:#8b4513; position:absolute; left:-5px; top:${size/10}px; transform:rotate(-40deg);"></div>
                    </div>
                    <!-- 오른쪽 뿔 -->
                    <div style="position:relative; width:${size/5}px;">
                        <div style="width:4px; height:${size/3}px; background:#8b4513; position:absolute; right:0; transform:rotate(20deg);"></div>
                        <div style="width:3px; height:${size/5}px; background:#8b4513; position:absolute; right:-5px; top:${size/10}px; transform:rotate(40deg);"></div>
                    </div>
                </div>
            `;
        }
        
        // ❄️ 눈송이 테두리
        if(activeDecorations.includes('decoration_snowflake')) {
            borderStyle = `border:4px solid #87ceeb; box-shadow:0 0 15px rgba(135,206,235,0.6), inset 0 0 15px rgba(135,206,235,0.3);`;
        }
        
        // 🖼️ 크리스마스 액자
        if(activeDecorations.includes('decoration_frame')) {
            borderStyle = `border:5px solid #d4af37; box-shadow:0 0 20px rgba(212,175,55,0.8), inset 0 0 10px rgba(255,215,0,0.5); background:linear-gradient(45deg, #d4af37 0%, #ffd700 100%); padding:3px;`;
        }
        
        // 💡 크리스마스 전구
        if(activeDecorations.includes('decoration_lights')) {
            shadowEffect = `box-shadow:0 0 20px rgba(255,215,0,0.8); animation:lightsGlow 1.5s ease-in-out infinite;`;
            decorationHTML += `
                <style>
                    @keyframes lightsGlow {
                        0%, 100% { box-shadow:0 0 20px rgba(255,0,0,0.8); }
                        33% { box-shadow:0 0 20px rgba(0,255,0,0.8); }
                        66% { box-shadow:0 0 20px rgba(0,0,255,0.8); }
                    }
                </style>
                <div style="position:absolute; top:-${size/12}px; left:-${size/12}px; right:-${size/12}px; bottom:-${size/12}px; border-radius:50%; pointer-events:none; ${shadowEffect}"></div>
            `;
            
            // 전구 장식
            const lightColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
            const lightCount = 8;
            for(let i = 0; i < lightCount; i++) {
                const angle = (360 / lightCount) * i;
                const color = lightColors[i % lightColors.length];
                decorationHTML += `
                    <div style="position:absolute; top:${size/2 - Math.cos(angle * Math.PI / 180) * (size/2 + size/15)}px; left:${size/2 + Math.sin(angle * Math.PI / 180) * (size/2 + size/15)}px; width:${size/12}px; height:${size/12}px; background:${color}; border-radius:50%; box-shadow:0 0 8px ${color}; animation:lightBlink ${1 + Math.random()}s ease-in-out infinite; z-index:5;"></div>
                `;
            }
            decorationHTML += `
                <style>
                    @keyframes lightBlink {
                        0%, 100% { opacity:1; transform:scale(1); }
                        50% { opacity:0.5; transform:scale(0.8); }
                    }
                </style>
            `;
        }
        
        // ⛄ 눈사람 친구
        if(activeDecorations.includes('decoration_snowman')) {
            decorationHTML += `
                <div style="position:absolute; bottom:-${size/10}px; right:-${size/4}px; z-index:10;">
                    <!-- 눈사람 몸체 -->
                    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                        <!-- 머리 -->
                        <div style="width:${size/4}px; height:${size/4}px; background:white; border-radius:50%; border:2px solid #ddd; position:relative; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                            <!-- 눈 -->
                            <div style="position:absolute; top:30%; left:25%; width:3px; height:3px; background:black; border-radius:50%;"></div>
                            <div style="position:absolute; top:30%; right:25%; width:3px; height:3px; background:black; border-radius:50%;"></div>
                            <!-- 코 -->
                            <div style="position:absolute; top:45%; left:50%; transform:translateX(-50%); width:0; height:0; border-left:3px solid transparent; border-right:3px solid transparent; border-top:6px solid orange;"></div>
                        </div>
                        <!-- 몸 -->
                        <div style="width:${size/3}px; height:${size/3}px; background:white; border-radius:50%; border:2px solid #ddd; margin-top:-5px; box-shadow:0 2px 5px rgba(0,0,0,0.2);"></div>
                    </div>
                </div>
            `;
        }
        
        // 🎁 선물 뱃지
        if(activeDecorations.includes('decoration_gift')) {
            decorationHTML += `
                <div style="position:absolute; top:-${size/12}px; right:-${size/12}px; z-index:10;">
                    <div style="background:white; border-radius:50%; padding:${size/20}px; box-shadow:0 2px 8px rgba(0,0,0,0.3); border:2px solid #c41e3a;">
                        <div style="font-size:${size/4}px; line-height:1;">🎁</div>
                    </div>
                </div>
            `;
        }
        
        // 기본 프로필 사진
        const basePhoto = photoUrl ? 
            `<img src="${photoUrl}" alt="프로필" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` :
            `<div style="width:100%; height:100%; border-radius:50%; background:#f1f3f4; display:flex; align-items:center; justify-content:center;">
                <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
            </div>`;
        
        return `
            <div style="position:relative; width:${size}px; height:${size}px; display:inline-block;">
                <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; ${borderStyle}">
                    ${basePhoto}
                </div>
                ${decorationHTML}
            </div>
        `;
        
    } catch(error) {
        console.error("장식 적용 실패:", error);
        return createProfilePhotoHTML(photoUrl, size);
    }
}

// 페이지 로드 시 상점 설정 로드
window.addEventListener('load', function() {
    loadShopConfig();
});

console.log("✅ 크리스마스 상점 시스템 로드 완료");