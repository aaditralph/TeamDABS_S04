#!/bin/bash

###############################################################################
# Genesis Backend - Workflow-Specific Tests
# Usage: ./test-workflows.sh [workflow_name]
# Workflows: approval, verification, leaderboard, all (default)
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

###############################################################################
# Workflow: Approval Process
###############################################################################

test_approval_workflow() {
    echo -e "\n${BLUE}=== Approval Workflow Test ===${NC}\n"
    
    echo "This workflow tests the complete approval process:"
    echo "1. Register Officer (needs approval)"
    echo "2. Try login (should fail)"
    echo "3. Admin approves"
    echo "4. Login succeeds"
    echo ""
    
    # Variables
    local OFFICER_EMAIL="workflow-officer@bmc.gov.in"
    local SOCIETY_EMAIL="workflow-society@test.in"
    
    # Step 1: Register Officer
    echo -e "${YELLOW}1. Registering Officer...${NC}"
    echo "Test Document" > /tmp/workflow-doc.txt
    local response=$(curl -s -X POST "$BASE_URL/api/officer/register" \
        -F "name=Workflow Officer" \
        -F "email=$OFFICER_EMAIL" \
        -F "password=password123" \
        -F "phone=9876543210" \
        -F "documentType=Aadhar" \
        -F "document=@/tmp/workflow-doc.txt")
    
    if echo "$response" | grep -q '"success":true'; then
        local OFFICER_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}✓ Officer registered: $OFFICER_ID${NC}"
        
        # Step 2: Try Login (should fail)
        echo -e "\n${YELLOW}2. Testing login before approval (should fail)...${NC}"
        response=$(curl -s -X POST "$BASE_URL/api/officer/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$OFFICER_EMAIL\",\"password\":\"password123\"}")
        
        if echo "$response" | grep -q '"Account pending admin approval"'; then
            echo -e "${GREEN}✓ Login correctly rejected before approval${NC}"
        else
            echo -e "${RED}✗ Unexpected response: $response${NC}"
        fi
        
        # Step 3: Admin Login
        echo -e "\n${YELLOW}3. Admin login...${NC}"
        response=$(curl -s -X POST "$BASE_URL/admin/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"DABS","password":"123"}')
        local ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Admin logged in${NC}"
        
        # Step 4: Admin Approves
        echo -e "\n${YELLOW}4. Admin approves officer...${NC}"
        response=$(curl -s -X PUT "$BASE_URL/admin/approve-officer/$OFFICER_ID" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        echo -e "${GREEN}✓ Response: $response${NC}"
        
        # Step 5: Login After Approval
        echo -e "\n${YELLOW}5. Testing login after approval...${NC}"
        response=$(curl -s -X POST "$BASE_URL/api/officer/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$OFFICER_EMAIL\",\"password\":\"password123\"}")
        
        if echo "$response" | grep -q '"success":true'; then
            echo -e "${GREEN}✓ Officer login successful after approval${NC}"
        else
            echo -e "${RED}✗ Login failed: $response${NC}"
        fi
    else
        echo -e "${RED}✗ Officer registration failed: $response${NC}"
    fi
    
    # Cleanup
    rm -f /tmp/workflow-doc.txt
    
    echo -e "\n${GREEN}Approval Workflow Test Complete${NC}\n"
}

###############################################################################
# Workflow: Verification Process
###############################################################################

test_verification_workflow() {
    echo -e "\n${BLUE}=== Verification Workflow Test ===${NC}\n"
    
    echo "This workflow tests the complete verification process:"
    echo "1. Society submits verification report with images"
    echo "2. AI processes verification"
    echo "3. BMC officer reviews"
    echo "4. Tax rebate calculated"
    echo ""
    
    # Login as society
    echo -e "${YELLOW}1. Society login...${NC}"
    local response=$(curl -s -X POST "$BASE_URL/api/society/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"testmanager@greenvalley.in","password":"password123"}')
    
    if echo "$response" | grep -q '"success":true'; then
        local SOCIETY_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        local SOCIETY_ACCOUNT_ID=$(echo "$response" | grep -o '"societyAccountId":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Society logged in${NC}"
        
        # Submit verification
        echo -e "\n${YELLOW}2. Submitting verification report...${NC}"
        response=$(curl -s -X POST "$BASE_URL/api/verification/report/upload" \
            -H "Authorization: Bearer $SOCIETY_TOKEN" \
            -F "societyAccountId=$SOCIETY_ACCOUNT_ID" \
            -F "meter_image=@$SCRIPT_DIR/../uploads/verification/test-meter.jpg" \
            -F "composter_image=@$SCRIPT_DIR/../uploads/verification/test-composter.jpg" \
            -F "gpsLatitude=19.0760" \
            -F "gpsLongitude=72.8777" \
            -F "notes=Verification workflow test")
        
        if echo "$response" | grep -q '"success":true'; then
            local REPORT_ID=$(echo "$response" | grep -o '"reportId":"[^"]*"' | cut -d'"' -f4)
            echo -e "${GREEN}✓ Report submitted: $REPORT_ID${NC}"
            
            # Process verification
            echo -e "\n${YELLOW}3. Processing verification (AI)...${NC}"
            response=$(curl -s -X POST "$BASE_URL/api/verification/detect" \
                -H "Authorization: Bearer $SOCIETY_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{\"reportId\":\"$REPORT_ID\"}")
            
            if echo "$response" | grep -q '"success":true'; then
                local STATUS=$(echo "$response" | grep -o '"verificationStatus":"[^"]*"' | cut -d'"' -f4)
                local PROB=$(echo "$response" | grep -o '"verificationProbability":[0-9.]*' | cut -d':' -f2)
                local REBATE=$(echo "$response" | grep -o '"rebateAmount":[0-9.]*' | cut -d':' -f2)
                echo -e "${GREEN}✓ Verification processed: Status=$STATUS, Probability=$PROB, Rebate=$REBATE${NC}"
                
                # Check leaderboard impact
                echo -e "\n${YELLOW}4. Checking leaderboard...${NC}"
                response=$(curl -s "$BASE_URL/api/resident/leaderboard")
                echo -e "${GREEN}✓ Leaderboard retrieved${NC}"
                
                # Check society tax rebates
                echo -e "\n${YELLOW}5. Checking tax rebates...${NC}"
                response=$(curl -s "$BASE_URL/api/resident/societies/Green%20Valley/tax-rebates")
                echo -e "${GREEN}✓ Tax rebates retrieved${NC}"
                
                echo -e "\n${GREEN}Verification Workflow Complete${NC}\n"
            else
                echo -e "${RED}✗ Verification failed: $response${NC}"
            fi
        else
            echo -e "${RED}✗ Report submission failed: $response${NC}"
        fi
    else
        echo -e "${RED}✗ Society login failed${NC}"
        echo "Make sure to run test-all.sh first to create test data"
    fi
}

###############################################################################
# Workflow: Leaderboard
###############################################################################

test_leaderboard_workflow() {
    echo -e "\n${BLUE}=== Leaderboard Workflow Test ===${NC}\n"
    
    echo "This workflow tests the leaderboard system:"
    echo "1. Get full leaderboard"
    echo "2. Get top N societies"
    echo "3. Get specific society rank"
    echo "4. Compare with neighbors"
    echo ""
    
    # Full leaderboard
    echo -e "${YELLOW}1. Getting full leaderboard...${NC}"
    local response=$(curl -s "$BASE_URL/api/resident/leaderboard?limit=10")
    local COUNT=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Leaderboard has $COUNT societies${NC}"
    
    # Show top 5
    echo -e "\n${YELLOW}2. Top 5 Societies:${NC}"
    response=$(curl -s "$BASE_URL/api/resident/leaderboard/top/5")
    echo "$response" | grep -o '"societyName":"[^"]*"' | nl || true
    
    # Get specific society rank
    echo -e "\n${YELLOW}3. Green Valley Society Rank:${NC}"
    response=$(curl -s "$BASE_URL/api/resident/leaderboard/society/Green%20Valley")
    local RANK=$(echo "$response" | grep -o '"rank":[0-9]*' | cut -d':' -f2)
    local SCORE=$(echo "$response" | grep -o '"overallScore":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Rank: $RANK, Overall Score: $SCORE${NC}"
    
    # Society details
    echo -e "\n${YELLOW}4. Society Details:${NC}"
    response=$(curl -s "$BASE_URL/api/resident/societies/Green%20Valley")
    local REBATES=$(echo "$response" | grep -o '"totalRebatesEarned":[0-9.]*' | cut -d':' -f2)
    local STREAK=$(echo "$response" | grep -o '"complianceStreak":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Total Rebates: $REBATES, Compliance Streak: $STREAK${NC}"
    
    echo -e "\n${GREEN}Leaderboard Workflow Complete${NC}\n"
}

###############################################################################
# Workflow: BMC Dashboard
###############################################################################

test_bmc_dashboard_workflow() {
    echo -e "\n${BLUE}=== BMC Dashboard Workflow Test ===${NC}\n"
    
    echo "This workflow tests the BMC officer dashboard:"
    echo "1. Officer login"
    echo "2. Get dashboard statistics"
    echo "3. Get pending reviews"
    echo "4. Review a report"
    echo "5. Get updated statistics"
    echo ""
    
    # Officer login
    echo -e "${YELLOW}1. Officer login...${NC}"
    local response=$(curl -s -X POST "$BASE_URL/api/officer/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"testofficer@bmc.gov.in","password":"password123"}')
    
    if echo "$response" | grep -q '"success":true'; then
        local OFFICER_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Officer logged in${NC}"
        
        # Dashboard stats
        echo -e "\n${YELLOW}2. Getting dashboard statistics...${NC}"
        response=$(curl -s "$BASE_URL/api/bmc/officer/dashboard" \
            -H "Authorization: Bearer $OFFICER_TOKEN")
        echo -e "${GREEN}✓ Dashboard stats retrieved${NC}"
        echo "$response" | head -c 500
        
        # Pending reviews
        echo -e "\n${YELLOW}3. Getting pending reviews...${NC}"
        response=$(curl -s "$BASE_URL/api/bmc/pending-reviews" \
            -H "Authorization: Bearer $OFFICER_TOKEN")
        local PENDING=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        echo -e "${GREEN}✓ Pending reviews: $PENDING${NC}"
        
        # Notifications
        echo -e "\n${YELLOW}4. Getting notifications...${NC}"
        response=$(curl -s "$BASE_URL/api/bmc/officer/notifications" \
            -H "Authorization: Bearer $OFFICER_TOKEN")
        echo -e "${GREEN}✓ Notifications retrieved${NC}"
        
        echo -e "\n${GREEN}BMC Dashboard Workflow Complete${NC}\n"
    else
        echo -e "${RED}✗ Officer login failed${NC}"
        echo "Make sure to run test-all.sh first to create test data"
    fi
}

###############################################################################
# Main
###############################################################################

main() {
    local workflow="${1:-all}"
    
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}Genesis Backend - Workflow Tests${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    echo "Base URL: $BASE_URL"
    echo "Workflow: $workflow"
    echo ""
    
    case "$workflow" in
        approval)
            test_approval_workflow
            ;;
        verification)
            test_verification_workflow
            ;;
        leaderboard)
            test_leaderboard_workflow
            ;;
        bmc)
            test_bmc_dashboard_workflow
            ;;
        all)
            test_approval_workflow
            test_verification_workflow
            test_leaderboard_workflow
            test_bmc_dashboard_workflow
            ;;
        *)
            echo "Usage: $0 [workflow_name]"
            echo "Workflows: approval, verification, leaderboard, bmc, all"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}All requested workflows completed!${NC}\n"
}

main "$@"
